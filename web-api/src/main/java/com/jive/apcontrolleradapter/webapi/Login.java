package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/login/")
@Produces(MediaType.TEXT_PLAIN)
public interface Login {
    @GET
    public Boolean isPlatformAdmin(@PathParam("unifises") String sessionId);

    @POST
    @Path("logout")
    public void logout(@PathParam("unifises") String sessionId);

    public String login();

    void setPermissionLevel(String sessionId, String permissionLevel);

    void setActiveAccount(String sessionId, String account);
}
