package com.jive.apcontrolleradapter.webapi;

import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
