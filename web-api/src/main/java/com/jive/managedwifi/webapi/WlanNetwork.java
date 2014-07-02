package com.jive.managedwifi.webapi;

import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
