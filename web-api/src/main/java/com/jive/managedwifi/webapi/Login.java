package com.jive.managedwifi.webapi;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/login/")
@Produces(MediaType.TEXT_PLAIN)
public interface Login {
	@GET
	public Boolean isPlatformAdmin(@PathParam("unifises") final String sessionId);

	@POST
	@Path("logout")
	public void logout(@PathParam("unifises") final String sessionId);

	public String login();

	void setPermissionLevel(final String sessionId, final String permissionLevel);

	void setActiveAccount(final String sessionId, final String account);
}
