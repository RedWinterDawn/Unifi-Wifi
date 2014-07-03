package com.jive.managedwifi.healthcheck;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.Response;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class HealthCheckImpl implements HealthCheckApi {

	private final static String username = "admin";
	private final static String password = "Jive123";
	private final static String baseurl = "https://unifi:8443";

	@Override
	public Response getHealth() {

		if (checkPortalApi() && checkUnifiController() && checkMongoDb())
			return Response.status(200).build();

		return Response.status(404).build();
	}

	private boolean checkPortalApi() {
		final Client client = ClientBuilder.newClient();
		final WebTarget target = client
				.target("https://api.jive.com/wifi/health-check/");
		final Response response = target.request().get();

		if (response.getStatus() == 200)
			return true;

		return false;
	}

	private boolean checkUnifiController() {
		// Login
		final Client client = ClientBuilder.newClient();
		final Response response = client
				.target(baseurl + "/login")
				.request()
				.cookie("tmpCookie", "/tmp/cookie")
				.post(Entity.form(new Form().param("login", "login")
						.param("username", username)
						.param("password", password)));

		if (response.getStatus() == 200)
			return true;

		return false;
	}

	private boolean checkMongoDb() {

		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target("http://localhost:27117/");
		final Response response = target.request().get();

		if (response.getStatus() == 200)
			return true;

		return false;
	}

}
