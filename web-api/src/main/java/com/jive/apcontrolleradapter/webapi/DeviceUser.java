package com.jive.apcontrolleradapter.webapi;

import java.util.Map;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/user/")
@Produces(MediaType.APPLICATION_JSON)
public interface DeviceUser {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Map getAll(@PathParam("unifises") String sessionId);

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("active")
    public Map getActive(@PathParam("unifises") String sessionId);
}
