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

import lombok.extern.slf4j.Slf4j;

import org.bson.types.ObjectId;

import com.jive.apcontrolleradapter.Configuration;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;

@Slf4j
public class UnifiBase {
    protected static MongoClient dbClient;
    protected static String controllerHost;
    protected static Properties props;

    public UnifiBase() throws IOException {
        dbClient = MongoDbClientFactory.getDbClient();
        controllerHost = Configuration.getControllerURL();
    }

    protected Map getData(final String sessionId, final String uri, final Map message){
        final Client client= ClientBuilder.newClient();
        final WebTarget target = client.target(controllerHost + uri);
        final Response response = target
                .request(MediaType.APPLICATION_JSON)
                .cookie("unifises", sessionId)
                .post(Entity.json(message == null ? "" : message));

        final Map fullResponse = response.readEntity(Map.class);
        return fullResponse;
    }

    protected Map postFormData(final String sessionId, final String uri, final javax.ws.rs.core.Form form){
        final Client client= ClientBuilder.newClient();
        final WebTarget target = client.target(controllerHost + uri);
        final Response response = target
                .request(MediaType.APPLICATION_FORM_URLENCODED)
                .cookie("unifises", sessionId)
                .post(Entity.form(form == null ? new Form() : form));

        final Map fullResponse = response.readEntity(Map.class);
        return fullResponse;
    }

    protected Map<String, Object> getSessionInfo(final String sessionId){
        final DB db = dbClient.getDB("ace");
        final DBCollection dbCollection = db.getCollection("cache_login");
        final BasicDBObject query = new BasicDBObject("cookie", sessionId);
        final DBObject session = dbCollection.findOne(query);
        if(session == null)
            throw new ForbiddenException();
        return session.toMap();
    }

    protected Map<String, Object> getExtendedSiteInfo(final String sessionId){
        final DB db = dbClient.getDB("ace");

        // get current site for session
        DBCollection dbCollection = db.getCollection("cache_login");
        BasicDBObject query = new BasicDBObject("cookie", sessionId);
        DBObject dbObject = dbCollection.findOne(query);
        if(dbObject == null)
            throw new ForbiddenException();

	String siteName = "";

	if (dbObject.get("site_id") != null) {
	    final String siteId = dbObject.get("site_id").toString();
	    // get site name for uri to controller
	    dbCollection = db.getCollection("site");
	    query = new BasicDBObject("_id", new ObjectId(siteId));
	    dbObject = dbCollection.findOne(query);
	    if (dbObject == null) //I wonder if this is ever not null as the site_id is not in the site collection
		throw new ForbiddenException();

	    siteName = dbObject.get("name") == null ? ""
		    : dbObject.get("name").toString();

	    dbCollection = db.getCollection("site_ext");
	    query = new BasicDBObject("site_id", siteId);
	    dbObject = dbCollection.findOne(query);

	    if (dbObject == null)
		throw new NotFoundException(
			"The site associated with your login could not be found");

	    dbCollection = db.getCollection("site_ext");
	    query = new BasicDBObject("site_id", siteId);
	    dbObject = dbCollection.findOne(query);
	}

        final Map<String, Object> map = dbObject.toMap();
        map.put("name", siteName);

        return map;
    }
}
