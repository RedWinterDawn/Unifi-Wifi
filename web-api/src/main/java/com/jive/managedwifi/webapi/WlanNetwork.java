package com.jive.managedwifi.webapi;

import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/{account}/{token}/network/")
@Produces(MediaType.APPLICATION_JSON)
public interface WlanNetwork {

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("groups/wlan")
	public Map getGroups(@PathParam("unifises") final String sessionId,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("groups/user")
	public Map getUserGroups(@PathParam("unifises") final String sessionId,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Map getNetworks(@PathParam("unifises") final String sessionId,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	public Map addNetwork(@PathParam("unifises") final String sessionId,
			final javax.ws.rs.core.Form network,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	public Map updateNetwork(@PathParam("unifises") final String sessionId,
			@PathParam("id") final String networkId,
			final javax.ws.rs.core.Form network,
			@PathParam("account") final String account,
			@PathParam("token") final String token);

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	public Map deleteNetwork(@PathParam("unifises") final String sessionId,
			@PathParam("id") final String networkId,
			@PathParam("account") final String account,
			@PathParam("token") final String token);
}
