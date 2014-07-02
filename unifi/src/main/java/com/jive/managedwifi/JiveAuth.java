package com.jive.managedwifi;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.codec.digest.DigestUtils;

import com.jive.managedwifi.unifi.UnifiBase;
import com.jive.managedwifi.unifi.UnifiLogin;
import com.jive.managedwifi.webapi.Auth;

@Slf4j
public class JiveAuth extends UnifiBase implements Auth {

	private final String portalAPIBaseURL;

	public JiveAuth() throws IOException {
		portalAPIBaseURL = Configuration.getPortalAPIBaseURL();
	}

	@Override
	public Map authorize(final String account, final String accessToken) {
		log.debug("Authorizing account: {} with token: {}", account,
				accessToken);
		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target(portalAPIBaseURL + "/user/");
		final Response response = target.request()
				.header("Authorization", "Bearer " + accessToken).get();

		final Map<String, Object> results = new HashMap<String, Object>();

		UnifiLogin unifiLogin;
		try {
			unifiLogin = new UnifiLogin();
		} catch (final IOException e) {
			throw new InternalServerErrorException(
					"Unable to initialize login service");
		}

		log.debug("Response {}", response.getStatus());
		if (response.getStatusInfo().getStatusCode() == 200) {
			final List<Map<String, String>> users = (List<Map<String, String>>) response
					.readEntity(Map.class).get("users");
			for (final Map<String, String> user : users) {
				if ("Platform-Admin"
						.equalsIgnoreCase(user.get("permissionLvl"))
						|| "Administrator".equalsIgnoreCase(user
								.get("permissionLvl"))
						|| "Platform-Customer-Service".equalsIgnoreCase(user
								.get("permissionLvl"))
						|| account.equals(user.get("pbxId"))) {
					results.put("permissionLevel", user.get("permissionLvl"));
					results.put("firstName", user.get("firstName"));
					results.put("lastName", user.get("lastName"));
					results.put("email", user.get("email").toLowerCase());
					results.put("emailHash",
							DigestUtils.md5(user.get("email").toLowerCase()));
					break;
				}
			}
		}

		if (results.size() == 0)
			throw new ForbiddenException(
					"Unable to retrieve user information from portals api");

		final String sessionId = unifiLogin.login();

		// Map account and accessToken to sessionId
		sessionIdTable.put(account, accessToken, sessionId);

		unifiLogin.setActiveAccount(sessionId, account);
		unifiLogin.setPermissionLevel(sessionId,
				(String) results.get("permissionLevel"));

		results.put("sessionId", sessionId);

		return results;
	}
}
