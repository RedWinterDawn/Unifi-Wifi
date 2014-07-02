package com.jive.managedwifi.unifi;

import java.io.IOException;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.PathParam;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;

import com.jive.managedwifi.webapi.Login;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;

public class UnifiLogin extends UnifiBase implements Login {
	public UnifiLogin() throws IOException {
	}

	@Override
	public Boolean isPlatformAdmin(final String sessionId) {
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null)
			throw new ForbiddenException();

		return "Platform-Admin".equalsIgnoreCase((String) dbObject
				.get("permissionLevel"))
				|| "Administrator".equalsIgnoreCase((String) dbObject
						.get("permissionLevel"))
				|| "Platform-Customer-Service"
						.equalsIgnoreCase((String) dbObject
								.get("permissionLevel"));
	}

	@Override
	public String login() {
		return baseUnifiLogin();
	}

	@Override
	public void logout(@PathParam("unifises") final String sessionId) {
		final Client client = ClientBuilder.newClient();
		client.target(controllerHost + "/logout").request()
				.cookie("unifises", sessionId).get();
	}

	@Override
	public void setPermissionLevel(final String sessionId,
			final String permissionLevel) {
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null)
			throw new ForbiddenException();

		final BasicDBObject update = new BasicDBObject("$set",
				new BasicDBObject("permissionLevel", permissionLevel));
		dbCollection.update(dbObject, update);
	}

	@Override
	public void setActiveAccount(final String sessionId, final String account) {
		final String siteId = getSiteIdForAccount(account);
		final DB db = dbClient.getDB("ace");

		// get current site for session
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final DBObject dbObject = dbCollection.findOne(query);
		if (dbObject == null)
			throw new ForbiddenException();

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

}
