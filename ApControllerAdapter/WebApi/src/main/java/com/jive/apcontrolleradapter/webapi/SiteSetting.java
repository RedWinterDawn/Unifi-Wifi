package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@Path("/{unifises}/site-setting/")
@Produces(MediaType.APPLICATION_JSON)
public interface SiteSetting {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map getSetting(@PathParam("unifises") String sessionId);

}
