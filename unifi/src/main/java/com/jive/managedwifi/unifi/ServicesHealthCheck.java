package com.jive.managedwifi.unifi;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.Response;

import lombok.extern.slf4j.Slf4j;

import com.jive.managedwifi.webapi.HealthCheck;

@Slf4j
public class ServicesHealthCheck implements HealthCheck {

	private final static String username = "admin";
	private final static String password = "Jive123";
	private final static String baseurl = "https://unifi:8443";

	@Override
	public Response getHealth() {
		log.debug("Running services health check");

		if (checkPortalApi() && checkUnifiController() && checkMongoDb()) {
			log.debug("Health check success!");
			return Response.status(200).build();
		}

		log.debug("Health check failed :(");
		return Response.status(500).build();
	}

	private boolean checkPortalApi() {
		log.debug("Testing Portal api");
		final Client client = ClientBuilder.newClient();
		final WebTarget target = client
				.target("https://api.jive.com/wifi/health-check/");
		final Response response = target.request().get();

		log.debug("Portal apis responded with {}", response.getStatus());

		if (response.getStatus() == 200)
			return true;

		return false;
	}

	private boolean checkUnifiController() {
		log.debug("Testing Unifi Controller");
		// Login
		final Client client = ClientBuilder.newClient();
		final Response response = client
				.target(baseurl + "/login")
				.request()
				.cookie("tmpCookie", "/tmp/cookie")
				.post(Entity.form(new Form().param("login", "login")
						.param("username", username)
						.param("password", password)));

		log.debug("Unifi Controller responded with {}", response.getStatus());

		if (response.getStatus() == 200 || response.getStatus() == 302)
			return true;

		return false;
	}

	private boolean checkMongoDb() {
		log.debug("Testing mongoDb");

		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target("http://localhost:27117/");
		final Response response = target.request().get();

		log.debug("Mongo DB responded with {}", response.getStatus());

		if (response.getStatus() == 200)
			return true;

		return false;
	}

}
