package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.util.AbstractMap;
import java.util.Map;
import java.util.Properties;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import lombok.extern.slf4j.Slf4j;

import org.bson.types.ObjectId;

import com.jive.managedwifi.Configuration;
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

	protected Map getData(final String sessionId, final String uri,
			final Map message, final String token, final String account) {
		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target(controllerHost + uri);
		final Response response = target.request(MediaType.APPLICATION_JSON)
				.cookie("unifises", sessionId)
				.post(Entity.json(message == null ? "" : message));

		log.debug("getData() status {}", response.getStatus());

		final Map fullResponse = response.readEntity(Map.class);

		final String responseMessage = ((Map) fullResponse.get("meta")).get(
				"rc").toString();
		log.debug("Meta rc={}", responseMessage);

		// Relog into unifi is response status bad
		if (response.getStatus() == 401 || responseMessage.equals("error")) {
			final String newSessionId = renewSessionId(sessionId, account,
					token);
			return getData(newSessionId, uri, message, token, account);
		}

		return fullResponse;
	}

	protected java.util.AbstractMap.SimpleEntry<String, String> getFirstAdminLogin() {
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("admin");
		final DBObject query = new BasicDBObject("name", "admin");
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null)
			throw new ForbiddenException();
		return new AbstractMap.SimpleEntry<String, String>("admin", dbObject
				.get("x_password").toString());
	}

	protected String baseUnifiLogin() {
		log.debug("Logging into unifi");
		final AbstractMap.SimpleEntry<String, String> firstAdminLogin = getFirstAdminLogin();

		final javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
		form.param("username", firstAdminLogin.getKey());
		form.param("password", firstAdminLogin.getValue());
		form.param("login", "login");

		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target(controllerHost + "/login");
		final Invocation.Builder builder = target
				.request(MediaType.APPLICATION_FORM_URLENCODED);
		final Response response = builder.post(Entity.form(form));
		final Map<String, NewCookie> cookies = response.getCookies();
		return cookies.get("unifises").getValue();
	}

	protected void baseSetPermissionLevel(final String sessionId,
			final String permissionLevel) {
		log.debug("setPermissionLevel()");
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null) {
			log.debug("dbObject is null");
			throw new ForbiddenException();
		}

		final BasicDBObject update = new BasicDBObject("$set",
				new BasicDBObject("permissionLevel", permissionLevel));
		dbCollection.update(dbObject, update);

	}

	protected void baseSetActiveAccount(final String sessionId,
			final String account) {
		log.debug("baseSetActiveAccount()");
		final String siteId = getSiteIdForAccount(account);
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null) {
			log.debug("dbObject is null");
			throw new ForbiddenException();
		}

		final BasicDBObject updateValues = new BasicDBObject();
		updateValues.put("site_id", siteId);
		updateValues.put("account_id", account);
		final BasicDBObject update = new BasicDBObject("$set", updateValues);
		dbCollection.update(dbObject, update);
	}

	private String getSiteIdForAccount(final String account) {
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("site_ext");
		final BasicDBObject query = new BasicDBObject("account_id", account);
		final DBObject dbObject = dbCollection.findOne(query);
		return dbObject == null ? null : (String) dbObject.get("site_id");
	}

	protected Map postFormData(final String sessionId, final String uri,
			final javax.ws.rs.core.Form form) {
		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target(controllerHost + uri);
		final Response response = target
				.request(MediaType.APPLICATION_FORM_URLENCODED)
				.cookie("unifises", sessionId)
				.post(Entity.form(form == null ? new Form() : form));

		final Map fullResponse = response.readEntity(Map.class);
		return fullResponse;
	}

	protected Map<String, Object> getSessionInfo(final String sessionId,
			final String account, final String token) {
		log.debug("getSessionInfo()");
		final DB db = dbClient.getDB("ace");
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject session = dbCollection.findOne(query);
		if (session == null) {
			log.debug("Session is null");
			final String newSessionId = renewSessionId(sessionId, account,
					token);
			return getSessionInfo(newSessionId, account, token);
		}

		return session.toMap();
	}

	private String renewSessionId(final String sessionId, final String account,
			final String token) {
		log.debug("renewSessionId()");
		log.debug("sessionId: {}", sessionId);

		// set sessionId in table
		final String newSessionId = baseUnifiLogin();
		baseSetActiveAccount(newSessionId, account);
		baseSetPermissionLevel(newSessionId, getPermissions(sessionId));
		return newSessionId;
	}

	private String getPermissions(final String sessionId) {
		log.debug("getPermissions()");
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null) {
			log.debug("dbObject is null");
			throw new ForbiddenException();
		}
		return (String) dbObject.get("permissionLevel");
	}

	protected Map<String, Object> getExtendedSiteInfo(final String sessionId,
			final String account, final String token) {
		log.debug("gettingExtendedSiteInfo()");
		final DB db = dbClient.getDB("ace");

		// get current site for session
		DBCollection dbCollection = db.getCollection("cache_login");
		BasicDBObject query = new BasicDBObject("cookie", sessionId);
		DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null) {
			log.debug("dbObject is null");
			final String newSessionId = renewSessionId(sessionId, account,
					token);
			return getExtendedSiteInfo(newSessionId, account, token);
		}

		String siteName = "";
		// log.debug("extended site info site_id: {}", dbObject.get("site_id"));
		if (dbObject.get("site_id") != null) {
			final String siteId = dbObject.get("site_id").toString();
			// get site name for uri to controller
			dbCollection = db.getCollection("site");
			query = new BasicDBObject("_id", new ObjectId(siteId));
			dbObject = dbCollection.findOne(query);
			// if (dbObject == null) //I wonder if this is ever not null as the
			// site_id is not in the site collection
			// throw new ForbiddenException();

			siteName = dbObject.get("name") == null ? "" : dbObject.get("name")
					.toString();

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