package com.jive.apcontrolleradapter.webapi;

import org.jboss.resteasy.annotations.Form;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@Path("/{unifises}/network/")
@Produces(MediaType.APPLICATION_JSON)
public interface WlanNetwork {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("groups/wlan")
    public Map getGroups(@PathParam("unifises") String sessionId);

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("groups/user")
    public Map getUserGroups(@PathParam("unifises") String sessionId);

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Map getNetworks(@PathParam("unifises") String sessionId);

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Map addNetwork(@PathParam("unifises") String sessionId, javax.ws.rs.core.Form network);

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Map updateNetwork(@PathParam("unifises") String sessionId, @PathParam("id") String networkId, javax.ws.rs.core.Form network);

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Map deleteNetwork(@PathParam("unifises") String sessionId, @PathParam("id") String networkId);
}
