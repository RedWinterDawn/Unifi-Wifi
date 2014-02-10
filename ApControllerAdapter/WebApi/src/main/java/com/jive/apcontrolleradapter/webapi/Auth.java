package com.jive.apcontrolleradapter.webapi;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@Path("/oauth/")
@Produces(MediaType.TEXT_PLAIN)
public interface Auth {
    @GET
    @Path("login-uri/{account}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getLoginUri(@PathParam("account") String account);

    @GET
    @Path("authorize/{account}/{code}")
    @Produces(MediaType.TEXT_PLAIN)
    public String authorize(@PathParam("account") String account, @PathParam("code") String code);
}
