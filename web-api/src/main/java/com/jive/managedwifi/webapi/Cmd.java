package com.jive.managedwifi.webapi;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/{account}/{token}/cmd/")
@Produces(MediaType.APPLICATION_JSON)
public interface Cmd
{

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @Path("{type}")
  public Map executeCmd(@PathParam("unifises") final String sessionId,
      @PathParam("type") final String type, final Map message,
      @PathParam("account") final String account,
      @PathParam("token") final String token);

  @GET
  @Path("email-alerts")
  public void emailAlerts(@QueryParam("interval") final int intervalInSeconds);
}
