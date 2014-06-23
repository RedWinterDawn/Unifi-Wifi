package com.jive.apcontrolleradapter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;

import com.jive.apcontrolleradapter.unifi.UnifiLogin;
import com.jive.apcontrolleradapter.webapi.Auth;

public class JiveAuth implements Auth{
	
	private final String baseURL;
	private final String clientID;
	private final String password;
	private final String redirectURI;
	private final String portalAPIBaseURL;
	
	private final String encodedCredentials;

	public JiveAuth() {
		baseURL = Configuration.getOAuthURL();
		clientID = Configuration.getOAuthClientID();
		password = Configuration.getOAuthPassword();
		redirectURI = Configuration.getOAuthRedirectURI();
		portalAPIBaseURL = Configuration.getPortalAPIBaseURL();
		encodedCredentials = Base64.encodeBase64String((clientID + ":" + password).getBytes());
	}
	
    @Override
    public String getLoginUri(String account) {
        Client client= ClientBuilder.newClient();
        WebTarget target =
            client.target(baseURL + "/grant")
            .queryParam("client_id", clientID)
            .queryParam("redirect_uri", redirectURI)
            .queryParam("response_type", "token")
            .queryParam("inflightrequest", account)
            .queryParam("scope", "pbx.v1.profile");

//        Response response = target.request().header("Authorization", "Basic " + props.getProperty("oauthBasicAuth")).get();
        Response response = target.request().get();
        if(response.getStatusInfo().getStatusCode() == 303){
            String location = (String) response.getHeaders().getFirst("Location");
            if(location != null && !location.equals(""))
                return location;
        }

        System.out.println(response.readEntity(String.class));
        throw new InternalServerErrorException("Unable to connect to OAuth provider");
    }

    @Override
    public Map authorize(String account, String accessToken) {
        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(baseURL + "/token");

        // javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
        // form.param("client_id", clientID);
        // form.param("redirect_uri", redirectURI);
        // form.param("grant_type", "authorization_code");
        // form.param("scope", "pbx.v1.profile");
        // form.param("code", code);

        // Response response = target.request(MediaType.APPLICATION_FORM_URLENCODED)
        //     .accept(MediaType.APPLICATION_JSON)
        //     .header("Authorization", "Basic " + encodedCredentials)
        //     .post(Entity.form(form))
        //     ;
        // if(response.getStatusInfo().getStatusCode() != 200)
        //     throw new ForbiddenException("Unable to authorize");

        //String accessToken = (String) response.readEntity(Map.class).get("access_token");
        target = client.target(portalAPIBaseURL + "/user/");
        Response response = target.request().header("Authorization", "Bearer "+accessToken).get();

        Map<String, Object> results = new HashMap<String, Object>();

        UnifiLogin unifiLogin;
        try {
            unifiLogin = new UnifiLogin();
        } catch (IOException e) {
            throw new InternalServerErrorException("Unable to initialize login service");
        }

        if(response.getStatusInfo().getStatusCode() == 200){
            List<Map<String, String>> users = (List<Map<String, String>>) response.readEntity(Map.class).get("users");
            for (Map<String, String> user : users){
                if("Platform-Admin".equalsIgnoreCase(user.get("permissionLvl")) 
                        ||"Administrator".equalsIgnoreCase(user.get("permissionLvl"))
                		|| "Platform-Customer-Service".equalsIgnoreCase(user.get("permissionLvl"))
                		|| account.equals(user.get("pbxId"))){
                    results.put("permissionLevel", user.get("permissionLvl"));
                    results.put("firstName", user.get("firstName"));
                    results.put("lastName", user.get("lastName"));
                    results.put("email", user.get("email").toLowerCase());
                    results.put("emailHash", DigestUtils.md5(user.get("email").toLowerCase()));
                    break;
                }
            }
        }

        if(results.size() == 0)
            throw new ForbiddenException("Unable to retrieve user information from portals api");

        String sessionId = unifiLogin.login();
        unifiLogin.setActiveAccount(sessionId, account);
        unifiLogin.setPermissionLevel(sessionId, (String) results.get("permissionLevel"));

        results.put("sessionId", sessionId);

        return results;
    }
}
