package com.jive.managedwifi.webapi;

import java.io.IOException;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/{account}/{token}/site-setting/")
@Produces(MediaType.APPLICATION_JSON)
public interface SiteSetting {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Map getSetting(@PathParam("unifises") final String sessionId,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	public Map updateSetting(@PathParam("unifises") final String sessionId,
			final javax.ws.rs.core.Form settings,
			@PathParam("account") final String account,
			@PathParam("token") final String token) throws IOException;

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("terms")
	public String updateTou(@PathParam("unifises") final String sessionId,
			final Map form, @PathParam("account") final String account,
			@PathParam("token") final String token) throws IOException,
			InterruptedException;

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Path("{id}")
	public Map updateLimits(@PathParam("unifises") final String sessionId,
			@PathParam("id") final String userGroupId,
			final javax.ws.rs.core.Form limits,
			@PathParam("account") final String account,
			@PathParam("token") final String token);
}
