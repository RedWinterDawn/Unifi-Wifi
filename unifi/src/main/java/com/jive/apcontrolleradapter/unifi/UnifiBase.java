package com.jive.apcontrolleradapter.unifi;

import java.io.IOException;
import java.util.Map;
import java.util.Properties;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.bson.types.ObjectId;

import com.jive.apcontrolleradapter.Configuration;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;

public class UnifiBase {
    protected static MongoClient dbClient;
    protected static String controllerHost;
    protected static Properties props;

    public UnifiBase() throws IOException {
        dbClient = MongoDbClientFactory.getDbClient();
        controllerHost = Configuration.getControllerURL();
    }

    protected Map getData(String sessionId, String uri, Map message){
        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(controllerHost + uri);
        Response response = target
                .request(MediaType.APPLICATION_JSON)
                .cookie("unifises", sessionId)
                .post(Entity.json(message == null ? "" : message));

        Map fullResponse = response.readEntity(Map.class);
        return fullResponse;
    }

    protected Map postFormData(String sessionId, String uri, javax.ws.rs.core.Form form){
        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(controllerHost + uri);
        Response response = target
                .request(MediaType.APPLICATION_FORM_URLENCODED)
                .cookie("unifises", sessionId)
                .post(Entity.form(form == null ? new Form() : form));

        Map fullResponse = response.readEntity(Map.class);
        return fullResponse;
    }

    protected Map<String, Object> getSessionInfo(String sessionId){
        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        DBObject session = dbCollection.findOne(query);
        if(session == null)
            throw new ForbiddenException();
        return session.toMap();
    }

    protected Map<String, Object> getExtendedSiteInfo(String sessionId){
        DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        DBObject dbObject = dbCollection.findOne(query);
        if(dbObject == null)
            throw new ForbiddenException();

        String siteId = dbObject.get("site_id").toString();

        // get site name for uri to controller
        dbCollection = db.getCollection("site");
        query = new BasicDBObject("_id", new ObjectId(siteId));
        dbObject = dbCollection.findOne(query);
        if(dbObject == null)
            throw new ForbiddenException();

        String siteName = dbObject.get("name").toString();

        dbCollection = db.getCollection("site_ext");
        query = new BasicDBObject("site_id", siteId);
        dbObject = dbCollection.findOne(query);

        if(dbObject == null)
            throw new NotFoundException("The site associated with your login could not be found");

        dbCollection = db.getCollection("site_ext");
        query = new BasicDBObject("site_id", siteId);
        dbObject = dbCollection.findOne(query);

        Map map = dbObject.toMap();
        map.put("name", siteName);

        return map;
    }
}
