package com.jive.managedwifi.webapi;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/oauth/v2/")
@Produces(MediaType.TEXT_PLAIN)
public interface Auth
{

  @GET
  @Path("authorize/{account}/{access_token}")
  @Produces(MediaType.APPLICATION_JSON)
  public Map authorize(@PathParam("account") final String account,
      @PathParam("access_token") final String access_token);
}
