package com.jive.apcontrolleradapter.webapi;

import java.util.Map;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/site-setting/")
@Produces(MediaType.APPLICATION_JSON)
public interface SiteSetting {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map getSetting(@PathParam("unifises") String sessionId);

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Map updateSetting(@PathParam("unifises") String sessionId, javax.ws.rs.core.Form settings);

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Path("{id}")
    public Map updateLimits(@PathParam("unifises") String sessionId, @PathParam("id") String userGroupId, javax.ws.rs.core.Form limits);
}
