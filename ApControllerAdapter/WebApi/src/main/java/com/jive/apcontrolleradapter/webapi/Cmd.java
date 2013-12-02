package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.Map;

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
