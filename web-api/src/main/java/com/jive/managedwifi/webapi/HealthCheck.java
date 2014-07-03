package com.jive.managedwifi.webapi;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@Path("/health-check")
public interface HealthCheck {

	@GET
	public Response getHealth();

}
