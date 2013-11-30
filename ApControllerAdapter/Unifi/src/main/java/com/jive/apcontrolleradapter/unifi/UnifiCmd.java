package com.jive.apcontrolleradapter.unifi;

import com.jive.apcontrolleradapter.webapi.Cmd;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
}
