package com.jive.managedwifi.webapi;

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

@Path("/{unifises}/{account}/{token}/site/")
@Produces(MediaType.APPLICATION_JSON)
public interface Site
{

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public List<Object> getSites(@PathParam("unifises") final String sessionId,
      @PathParam("account") final String account,
      @PathParam("token") final String token);

  @GET
  @Path("{id}")
  @Produces(MediaType.APPLICATION_JSON)
  public Map getById(@PathParam("id") final String id,
      @PathParam("account") final String account,
      @PathParam("token") final String token);

  @POST
  @Path("{id}")
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public void update(@PathParam("id") final String id, final Map site,
      @PathParam("account") final String account,
      @PathParam("token") final String token);

  @PUT
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.TEXT_PLAIN)
  public String add(@PathParam("unifises") final String sessionId,
      final Map site, @PathParam("account") final String account,
      @PathParam("token") final String token);

  @DELETE
  @Path("{id}")
  public void delete(@PathParam("unifises") final String sessionId,
      @PathParam("id") final String id,
      @PathParam("account") final String account,
      @PathParam("token") final String token);

  @POST
  @Path("active")
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
  public void makeActive(@PathParam("unifises") final String sessionId,
      final Map site, @PathParam("account") final String account,
      @PathParam("token") final String token);

}
