package com.jive.apcontrolleradapter.unifi;

import com.jive.apcontrolleradapter.webapi.Site;
import com.mongodb.*;

import org.bson.types.ObjectId;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.PathParam;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UnifiSite extends UnifiBase implements Site {

    public UnifiSite() throws IOException {
    }

    @Override
    public List<Object> getSites(String sessionId) {
        Map<String, Object> session = getSessionInfo(sessionId);

        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection("site_ext");
        BasicDBObject query = new BasicDBObject("account_id", session.get("account_id"));
        DBCursor dbObjects = dbCollection.find(query);
        if(dbObjects.count() == 0)
            return new ArrayList<Object>();

        List<Object> sites = new ArrayList<Object>();
        try {
            while(dbObjects.hasNext()) {
                Map site = dbObjects.next().toMap();
                site.remove("devices");
                site.remove("_id");
                site.put("is_selected", session.get("site_id").toString().equals(site.get("site_id")));
                sites.add(site);
            }
        } finally {
            dbObjects.close();
        }

        return sites;
    }

    @Override
    public Map getById(@PathParam("id") String id) {
        DB db = dbClient.getDB("ace");

        DBCollection dbCollection = db.getCollection("site_ext");
        BasicDBObject query = new BasicDBObject("site_id", id);
        DBObject site = dbCollection.findOne(query);
        if(site == null)
            throw new NotFoundException("The site could not be found");

        return site.toMap();
    }


    @Override
    public void update(String id, Map site) {
        site.remove("_id");
        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection("site_ext");
        BasicDBObject query = new BasicDBObject("site_id", id);
        dbCollection.update(query, new BasicDBObject(site));
    }

    public String add(String sessionId, Map site){
        Map<String, Object> session = getSessionInfo(sessionId);

        if (!("Platform-Admin".equalsIgnoreCase((String) session.get("permissionLevel"))
        		|| "Platform-Customer-Service".equalsIgnoreCase((String) session.get("permissionLevel"))
        		))
            throw new ForbiddenException();

        javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
        form.param("json", String.format("{'name':'%s','desc':'%s','cmd':'add-site'}", Utils.randomString(20), site.get("friendly_name")));

        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(controllerHost + "/api/s/super/cmd/sitemgr");
        Response response = target
                .request(MediaType.APPLICATION_FORM_URLENCODED)
                .cookie("unifises", sessionId)
                .post(Entity.form(form));
        Map newSite = response.readEntity(Map.class);
        String newSiteId = ((List<Map>) newSite.get("data")).get(0).get("_id").toString();
        site.put("site_id", newSiteId);
        site.put("account_id", session.get("account_id"));

        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection("site_ext");
        dbCollection.insert(new BasicDBObject(site));

        dbCollection = db.getCollection("site_ext");
        BasicDBObject query = new BasicDBObject("account_id", session.get("account_id"));
        if(dbCollection.count(query) == 1)
            makeActive(sessionId, newSiteId);
        return newSiteId;
    }

    public void delete(String sessionId, String id) {
        javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
        form.param("json", String.format("{'cmd':'delete-site','site':'%s'}", id));

        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(controllerHost + "/api/s/super/cmd/sitemgr");
        Response response = target
                .request(MediaType.APPLICATION_FORM_URLENCODED)
                .cookie("unifises", sessionId)
                .post(Entity.form(form));

        Map fullResponse = response.readEntity(Map.class);
        if(response.getStatusInfo() != Response.Status.OK)
            throw new BadRequestException();

        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection("site_ext");
        BasicDBObject query = new BasicDBObject("site_id", id);
        dbCollection.remove(query);
    }

    @Override
    public void makeActive(String sessionId, Map site){
        Map<String, Object> session = getSessionInfo(sessionId); //authenticates
        makeActive(sessionId, (String) site.get("site_id"));
    }

    private void makeActive(String sessionId, String siteId){
        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        BasicDBObject update = new BasicDBObject("$set", new BasicDBObject("site_id", siteId));
        dbCollection.update(query, update);
    }
}
