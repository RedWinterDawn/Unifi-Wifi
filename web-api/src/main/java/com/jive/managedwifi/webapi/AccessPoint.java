package com.jive.managedwifi.webapi;

import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/{account}/{token}/device/")
@Produces(MediaType.APPLICATION_JSON)
public interface AccessPoint {

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Map getAll(@PathParam("unifises") final String sessionId,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@POST
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	public Map update(@PathParam("unifises") final String sessionId,
			@PathParam("id") final String deviceId,
			final javax.ws.rs.core.Form device,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

}
