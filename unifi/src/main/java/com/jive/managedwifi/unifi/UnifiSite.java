package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.PathParam;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.jive.managedwifi.webapi.Site;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;

public class UnifiSite extends UnifiBase implements Site {

	public UnifiSite() throws IOException {
	}

	@Override
	public List<Object> getSites(final String sessionId, final String account,
			final String token) {
		final Map<String, Object> session = getSessionInfo(sessionId, account,
				token);

		final DB db = dbClient.getDB("ace");
		final DBCollection dbCollection = db.getCollection("site_ext");
		final BasicDBObject query = new BasicDBObject("account_id",
				session.get("account_id"));
		final DBCursor dbObjects = dbCollection.find(query);
		if (dbObjects.count() == 0)
			return new ArrayList<Object>();

		final List<Object> sites = new ArrayList<Object>();
		try {
			while (dbObjects.hasNext()) {
				final Map site = dbObjects.next().toMap();
				site.remove("devices");
				site.remove("_id");
				site.put("is_selected", session.get("site_id").toString()
						.equals(site.get("site_id")));
				sites.add(site);
			}
		} finally {
			dbObjects.close();
		}

		return sites;
	}

	@Override
	public Map getById(@PathParam("id") final String id, final String account,
			final String token) {
		final DB db = dbClient.getDB("ace");

		final DBCollection dbCollection = db.getCollection("site_ext");
		final BasicDBObject query = new BasicDBObject("site_id", id);
		final DBObject site = dbCollection.findOne(query);
		if (site == null)
			throw new NotFoundException("The site could not be found");

		return site.toMap();
	}

	@Override
	public void update(final String id, final Map site, final String account,
			final String token) {
		site.remove("_id");
		final DB db = dbClient.getDB("ace");
		final DBCollection dbCollection = db.getCollection("site_ext");
		final BasicDBObject query = new BasicDBObject("site_id", id);
		dbCollection.update(query, new BasicDBObject(site));
	}

	@Override
	@SuppressWarnings("rawtypes")
	public String add(final String sessionId, final Map site,
			final String account, final String token) {
		final Map<String, Object> session = getSessionInfo(sessionId, account,
				token);

		if (!("Platform-Admin".equalsIgnoreCase((String) session
				.get("permissionLevel"))
				|| "Administrator".equalsIgnoreCase((String) session
						.get("permissionLevel")) || "Platform-Customer-Service"
					.equalsIgnoreCase((String) session.get("permissionLevel"))))
			throw new ForbiddenException();

		final javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
		form.param("json", String.format(
				"{'name':'%s','desc':'%s','cmd':'add-site'}",
				Utils.randomString(20), site.get("friendly_name")));

		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target(controllerHost
				+ "/api/s/super/cmd/sitemgr");
		final Response response = target
				.request(MediaType.APPLICATION_FORM_URLENCODED)
				.cookie("unifises", sessionId).post(Entity.form(form));
		final Map newSite = response.readEntity(Map.class);
		final String newSiteId = ((List<Map>) newSite.get("data")).get(0)
				.get("_id").toString();
		site.put("site_id", newSiteId);
		site.put("account_id", session.get("account_id"));

		final DB db = dbClient.getDB("ace");
		DBCollection dbCollection = db.getCollection("site_ext");
		dbCollection.insert(new BasicDBObject(site));

		dbCollection = db.getCollection("site_ext");
		final BasicDBObject query = new BasicDBObject("account_id",
				session.get("account_id"));
		if (dbCollection.count(query) == 1)
			makeActive(sessionId, newSiteId);
		return newSiteId;
	}

	@Override
	public void delete(final String sessionId, final String id,
			final String account, final String token) {
		final javax.ws.rs.core.Form form = new javax.ws.rs.core.Form();
		form.param("json",
				String.format("{'cmd':'delete-site','site':'%s'}", id));

		final Client client = ClientBuilder.newClient();
		final WebTarget target = client.target(controllerHost
				+ "/api/s/super/cmd/sitemgr");
		final Response response = target
				.request(MediaType.APPLICATION_FORM_URLENCODED)
				.cookie("unifises", sessionId).post(Entity.form(form));

		final Map fullResponse = response.readEntity(Map.class);
		if (response.getStatusInfo() != Response.Status.OK)
			throw new BadRequestException();

		final DB db = dbClient.getDB("ace");
		final DBCollection dbCollection = db.getCollection("site_ext");
		final BasicDBObject query = new BasicDBObject("site_id", id);
		dbCollection.remove(query);
	}

	@Override
	public void makeActive(final String sessionId, final Map site,
			final String account, final String token) {
		final Map<String, Object> session = getSessionInfo(sessionId, account,
				token); // authenticates
		makeActive(sessionId, (String) site.get("site_id"));
	}

	private void makeActive(final String sessionId, final String siteId) {
		final DB db = dbClient.getDB("ace");
		final DBCollection dbCollection = db.getCollection("cache_login");
		final BasicDBObject query = new BasicDBObject("cookie", sessionId);
		final BasicDBObject update = new BasicDBObject("$set",
				new BasicDBObject("site_id", siteId));
		dbCollection.update(query, update);
	}
}
