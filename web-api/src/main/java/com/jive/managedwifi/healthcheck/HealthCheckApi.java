package com.jive.managedwifi.healthcheck;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@Path("/health-check")
public interface HealthCheckApi {

	@GET
	public Response getHealth();

}
