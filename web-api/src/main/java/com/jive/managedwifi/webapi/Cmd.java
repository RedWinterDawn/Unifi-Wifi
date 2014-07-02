package com.jive.managedwifi.webapi;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/cmd/")
@Produces(MediaType.APPLICATION_JSON)
public interface Cmd {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{type}")
    public Map executeCmd(@PathParam("unifises") String sessionId, @PathParam("type") String type, Map message);

    @GET
    @Path("email-alerts")
    public void emailAlerts(@QueryParam("interval") int intervalInSeconds);
}
