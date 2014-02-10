package com.jive.apcontrolleradapter.unifi;

import com.jive.apcontrolleradapter.webapi.Login;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.PathParam;
import javax.ws.rs.client.*;
import javax.ws.rs.core.*;
import java.io.IOException;
import java.util.AbstractMap;
import java.util.Map;

public class UnifiLogin extends UnifiBase implements Login {
    public UnifiLogin() throws IOException {
    }

    @Override
    public Boolean isPlatformAdmin(String sessionId) {
        DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        DBObject dbObject = dbCollection.findOne(query);
        if(dbObject == null)
            throw new ForbiddenException();

        return dbObject.get("permissionLvl") != null && ((String) dbObject.get("permissionLvl")).equalsIgnoreCase("Platform-Admin");
    }

    @Override
    public void logout(@PathParam("unifises") String sessionId) {
        Client client= ClientBuilder.newClient();
        client.target(controllerHost + "/logout").request().cookie("unifises", sessionId).get();
    }

    @Override
    public void setPermissionLevel(String sessionId, String permissionLevel) {
        DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        DBObject dbObject = dbCollection.findOne(query);
        if(dbObject == null)
            throw new ForbiddenException();

        BasicDBObject update = new BasicDBObject("$set", new BasicDBObject("permissionLvl", permissionLevel));
        dbCollection.update(dbObject, update);
    }

    @Override
    public String login() {
        AbstractMap.SimpleEntry<String, String> firstAdminLogin = getFirstAdminLogin();

        javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
        form.param("username", firstAdminLogin.getKey());
        form.param("password", firstAdminLogin.getValue());
        form.param("login", "login");

        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(controllerHost + "/login");
        Invocation.Builder builder = target.request(MediaType.APPLICATION_FORM_URLENCODED);
        Response response = builder.post(Entity.form(form));
        Map<String, NewCookie> cookies = response.getCookies();
        return cookies.get("unifises").getValue();
    }

    @Override
    public void setActiveAccount(String sessionId, String account) {
        String siteId = getSiteIdForAccount(account);
        DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        DBObject dbObject = dbCollection.findOne(query);
        if(dbObject == null)
            throw new ForbiddenException();

        BasicDBObject updateValues = new BasicDBObject();
        updateValues.put("site_id", siteId);
        updateValues.put("account_id", account);
        BasicDBObject update = new BasicDBObject("$set", updateValues);
        dbCollection.update(dbObject, update);
    }

    private String getSiteIdForAccount(String account){
        DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("site_ext");
        BasicDBObject query = new BasicDBObject("account_id", account);
        DBObject dbObject = dbCollection.findOne(query);
        return dbObject == null ? null : (String) dbObject.get("site_id");
    }

    private java.util.AbstractMap.SimpleEntry<String, String> getFirstAdminLogin(){
        DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("admin");
        DBObject dbObject = dbCollection.findOne();
        if(dbObject == null)
            throw new ForbiddenException();
        return new AbstractMap.SimpleEntry<String, String>(dbObject.get("name").toString(),dbObject.get("x_password").toString());
    }
}
