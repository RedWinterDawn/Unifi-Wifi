package com.jive.apcontrolleradapter;

import com.jive.apcontrolleradapter.unifi.MongoDbClientFactory;
import com.jive.apcontrolleradapter.unifi.UnifiBase;
import com.jive.apcontrolleradapter.unifi.UnifiLogin;
import com.jive.apcontrolleradapter.webapi.Auth;
import com.mongodb.*;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.PathParam;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.*;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.*;

public class JiveAuth implements Auth{
    private final Properties props;

    public JiveAuth() throws IOException {
        props = new Properties();
        props.load(getClass().getClassLoader().getResourceAsStream("/com/jive/apcontrolleradapter/jive.properties"));
    }

    @Override
    public String getLoginUri(String account) {
        Client client= ClientBuilder.newClient();
        WebTarget target =
            client.target(props.getProperty("oauthUri") + "/grant")
            .queryParam("client_id", props.getProperty("oauthUsername"))
            .queryParam("redirect_uri", props.getProperty("oauthRedirect"))
            .queryParam("response_type", "code")
            .queryParam("state", account);

        Response response = target.request().header("Authorization", "Basic " + props.getProperty("oauthBasicAuth")).get();
        if(response.getStatusInfo().getStatusCode() == 303){
            String location = (String) response.getHeaders().getFirst("Location");
            if(location != null && !location.equals(""))
                return location;
        }

        throw new InternalServerErrorException("Unable to connect to OAuth provider");
    }

    @Override
    public String authorize(String account, String code) {
        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(props.getProperty("oauthUri") + "/token");

        javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
        form.param("client_id", props.getProperty("oauthUsername"));
        form.param("redirect_uri", props.getProperty("oauthRedirect"));
        form.param("grant_type", "authorization_code");
        form.param("code", code);

        Response response = target.request(MediaType.APPLICATION_FORM_URLENCODED)
            .accept(MediaType.APPLICATION_JSON)
            .header("Authorization", "Basic " + props.getProperty("oauthBasicAuth"))
            .post(Entity.form(form))
            ;
        if(response.getStatusInfo().getStatusCode() != 200)
            throw new ForbiddenException("Unable to authorize");

        String accessToken = (String) response.readEntity(Map.class).get("access_token");
        target = client.target(props.getProperty("portalsApi") + "/user/");
        response = target.request().header("Authorization", "Bearer "+accessToken).get();

        Map<String, String> result = new HashMap<String, String>();
        String permissionLevel = null;
        UnifiLogin unifiLogin;
        try {
            unifiLogin = new UnifiLogin();
        } catch (IOException e) {
            throw new InternalServerErrorException("Unable to initialize login service");
        }

        if(response.getStatusInfo().getStatusCode() == 200){
            List<Map<String, String>> users = (List<Map<String, String>>) response.readEntity(Map.class).get("users");
            for (Map<String, String> user : users){
                if(user.get("permissionLvl").equalsIgnoreCase("Platform-Admin")){
                    permissionLevel = user.get("permissionLvl");
                    break;
                } else {
                    if(user.get("pbx").equals(account)){
                        permissionLevel = user.get("permissionLvl");
                    }
                }
            }
        }

        if(permissionLevel == null)
            throw new ForbiddenException("Unable to retrieve user information from portals api");

        String sessionId = unifiLogin.login();
        unifiLogin.setActiveAccount(sessionId, account);
        unifiLogin.setPermissionLevel(sessionId, permissionLevel);
        return sessionId;
    }
}
