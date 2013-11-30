package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@Path("/{unifises}/device/")
@Produces(MediaType.APPLICATION_JSON)
public interface AccessPoint {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Map getAll(@PathParam("unifises") String sessionId);

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    public Map update(@PathParam("unifises") String sessionId, @PathParam("id") String deviceId, javax.ws.rs.core.Form device);

}
