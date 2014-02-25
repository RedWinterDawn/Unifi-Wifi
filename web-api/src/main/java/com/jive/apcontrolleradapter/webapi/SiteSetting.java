package com.jive.apcontrolleradapter.webapi;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/{unifises}/site-setting/")
@Produces(MediaType.APPLICATION_JSON)
public interface SiteSetting {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map getSetting(@PathParam("unifises") String sessionId);

}
