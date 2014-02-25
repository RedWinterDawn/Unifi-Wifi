package com.jive.apcontrolleradapter.webapi;

import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
