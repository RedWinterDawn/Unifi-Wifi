package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;

@Path("/{unifises}/site/")
@Produces(MediaType.APPLICATION_JSON)
public interface Site {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Object> getSites(@PathParam("unifises") String sessionId);

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Map getById(@PathParam("id") String id);

    @POST
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void update(@PathParam("id") String id, Map site);

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    public String add(@PathParam("unifises") String sessionId, Map site);

    @DELETE
    @Path("{id}")
    public void delete(@PathParam("unifises") String sessionId, @PathParam("id") String id);

    @POST
    @Path("active")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public void makeActive(@PathParam("unifises") String sessionId, Map site);

}
