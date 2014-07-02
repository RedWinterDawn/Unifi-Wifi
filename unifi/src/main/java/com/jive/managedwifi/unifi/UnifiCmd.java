package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import com.jive.managedwifi.webapi.Cmd;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;

public class UnifiCmd extends UnifiBase implements Cmd {

    public UnifiCmd() throws IOException {
    }


    @Override
    public Map executeCmd(String sessionId, String type, Map message) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);

        Client client= ClientBuilder.newClient();
        WebTarget target = client.target(controllerHost + String.format("/api/s/%s/cmd/%s", siteInfo.get("name"), type));
        Response response = target
                .request("application/json")
                .cookie("unifises", sessionId)
                .post(Entity.json(message));

        Map fullResponse = response.readEntity(Map.class);
        return fullResponse;
    }

    @Override
    public void emailAlerts(int intervalInSeconds) {
        long time = System.currentTimeMillis() - intervalInSeconds * 1000;
        DB db = dbClient.getDB("ace");

        DBCollection dbCollection = db.getCollection("site_ext");
        DBCursor dbObjects = dbCollection.find();
        List<Map> sites = new ArrayList<Map>();
        try {
            while(dbObjects.hasNext())
                sites.add(dbObjects.next().toMap());
        } finally {
            dbObjects.close();
        }

        sendAlerts(sites, time, true);
        sendAlerts(sites, time, false);
    }

    private void sendAlerts(List<Map> sites, long time, boolean forConnects){
        DB db = dbClient.getDB("ace");
        DBCollection dbCollection = db.getCollection(forConnects ? "event" : "alarm");
        BasicDBObject query = new BasicDBObject("time", new BasicDBObject("$gt", time)).append("key", forConnects ? "EVT_AP_Connected" : "EVT_AP_Lost_Contact");
        DBCursor dbObjects = dbCollection.find(query);

        try {
            while(dbObjects.hasNext()) {
                Map alert = dbObjects.next().toMap();
                sendEmail(sites,
                        alert.get("site_id").toString(),
                        alert.get("ap_name") == null || alert.get("ap_name").equals("") ? alert.get("ap").toString() : alert.get("ap_name").toString(),
                        forConnects
                );
            }
        } catch (MessagingException e) {
            throw new InternalServerErrorException(e);
        } finally {
            dbObjects.close();
        }
    }

    private void sendEmail(List<Map> sites, String siteId, String ap, boolean isConnected) throws MessagingException {
        Session session = Session.getDefaultInstance(props);
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(props.get("mail.from").toString()));

        Map foundSite = null;
        for (Map site : sites){
            if(site.get("site_id").equals(siteId)){
                foundSite = site;
                break;
            }
        }

        if(foundSite == null)
            throw new InternalServerErrorException(String.format("Site for alert not found"));

        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(foundSite.get("alert_email").toString()));
        message.setSubject(props.get("apAlertSubject").toString());
        message.setText(MessageFormat.format(
                props.get("apAlertMessage").toString(),
                ap,
                foundSite.get("friendly_name").toString(),
                isConnected ? "connected" : "disconnected"
        ));
        Transport.send(message);
    }

}
