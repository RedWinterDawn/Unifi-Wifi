package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.util.Map;

import com.jive.managedwifi.webapi.WlanNetwork;

public class UnifiWlanNetwork extends UnifiBase implements WlanNetwork {

    public UnifiWlanNetwork() throws IOException {
    }

    @Override
    public Map getGroups(final String sessionId) {
        return getResponse(sessionId, "/api/s/%s/list/wlangroup");
    }

    @Override
    public Map getUserGroups(final String sessionId) {
        return getResponse(sessionId, "/api/s/%s/list/usergroup");
    }

    @Override
    public Map getNetworks(final String sessionId) {
        return getResponse(sessionId, "/api/s/%s/list/wlanconf");
    }

    @Override
    public Map addNetwork(final String sessionId, final javax.ws.rs.core.Form network) {
        final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/add/wlanconf", siteInfo.get("name")), network);
    }

    @Override
    public Map updateNetwork(final String sessionId, final String networkId, final javax.ws.rs.core.Form network) {
        final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/upd/wlanconf/%s", siteInfo.get("name"), networkId), network);
    }

    @Override
    public Map deleteNetwork(final String sessionId, final String networkId) {
        final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/del/wlanconf/%s", siteInfo.get("name"), networkId), null);
    }

    private Map getResponse(final String sessionId, final String uri) {
        final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return getData(sessionId, String.format(uri, siteInfo.get("name")), null);
    }

}
