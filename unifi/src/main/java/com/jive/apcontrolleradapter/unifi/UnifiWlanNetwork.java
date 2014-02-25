package com.jive.apcontrolleradapter.unifi;

import java.io.IOException;
import java.util.Map;

import com.jive.apcontrolleradapter.webapi.WlanNetwork;

public class UnifiWlanNetwork extends UnifiBase implements WlanNetwork {

    public UnifiWlanNetwork() throws IOException {
    }

    @Override
    public Map getGroups(String sessionId) {
        return getResponse(sessionId, "/api/s/%s/list/wlangroup");
    }

    @Override
    public Map getUserGroups(String sessionId) {
        return getResponse(sessionId, "/api/s/%s/list/usergroup");
    }

    @Override
    public Map getNetworks(String sessionId) {
        return getResponse(sessionId, "/api/s/%s/list/wlanconf");
    }

    @Override
    public Map addNetwork(String sessionId, javax.ws.rs.core.Form network) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/add/wlanconf", siteInfo.get("name")), network);
    }

    @Override
    public Map updateNetwork(String sessionId, String networkId, javax.ws.rs.core.Form network) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/upd/wlanconf/%s", siteInfo.get("name"), networkId), network);
    }

    @Override
    public Map deleteNetwork(String sessionId, String networkId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/del/wlanconf/%s", siteInfo.get("name"), networkId), null);
    }

    private Map getResponse(String sessionId, String uri) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return getData(sessionId, String.format(uri, siteInfo.get("name")), null);
    }

}
