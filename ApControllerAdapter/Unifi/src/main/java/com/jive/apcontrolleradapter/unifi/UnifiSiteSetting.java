package com.jive.apcontrolleradapter.unifi;

import com.jive.apcontrolleradapter.webapi.SiteSetting;

import java.io.IOException;
import java.util.Map;

public class UnifiSiteSetting extends UnifiBase implements SiteSetting {

    public UnifiSiteSetting() throws IOException {
    }

    @Override
    public Map getSetting(String sessionId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        Map name = getData(sessionId, String.format("/api/s/%s/get/setting", siteInfo.get("name")), null);
        return name;
    }
}
