package com.jive.apcontrolleradapter.webapi;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/oauth/")
@Produces(MediaType.TEXT_PLAIN)
public interface Auth {
    @GET
    @Path("login-uri/{account}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getLoginUri(@PathParam("account") String account);

    @GET
    @Path("authorize/{account}/{code}")
    @Produces(MediaType.APPLICATION_JSON)
    public Map authorize(@PathParam("account") String account, @PathParam("code") String code);
}
