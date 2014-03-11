package com.jive.apcontrolleradapter.unifi;

import java.io.IOException;
import java.util.Map;

import com.jive.apcontrolleradapter.webapi.SiteSetting;

import javax.ws.rs.core.Form;

public class UnifiSiteSetting extends UnifiBase implements SiteSetting {

    public UnifiSiteSetting() throws IOException {
    }

    @Override
    public Map getSetting(String sessionId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        Map name = getData(sessionId, String.format("/api/s/%s/get/setting", siteInfo.get("name")), null);
        return name;
    }

    @Override
    public Map updateSetting(String sessionId, Form settings) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/set/setting/guest_access", siteInfo.get("name")), settings);
    }

    @Override
    public Map updateLimits(String sessionId, String userGroupId, Form limits) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/upd/usergroup/%s", siteInfo.get("name"), userGroupId), limits);
    }
}
