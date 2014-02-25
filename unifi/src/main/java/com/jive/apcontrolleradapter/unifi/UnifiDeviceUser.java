package com.jive.apcontrolleradapter.unifi;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.jive.apcontrolleradapter.webapi.DeviceUser;

public class UnifiDeviceUser extends UnifiBase implements DeviceUser {

    public UnifiDeviceUser() throws IOException {
    }

    @Override
    public Map getAll(String sessionId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        Map<String, Object> message = new HashMap<String, Object>();
        message.put("type", "all");
        message.put("is_offline", false);
        message.put("within", "144");
        return getData(sessionId, String.format("/api/s/%s/stat/alluser", siteInfo.get("name")), message);
    }

    @Override
    public Map getActive(String sessionId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return getData(sessionId, String.format("/api/s/%s/stat/sta", siteInfo.get("name")), null);
    }


}
