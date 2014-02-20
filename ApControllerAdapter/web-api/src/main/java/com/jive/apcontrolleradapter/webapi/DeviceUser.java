package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

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
