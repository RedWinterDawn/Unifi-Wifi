package com.jive.apcontrolleradapter.unifi;

import com.jive.apcontrolleradapter.webapi.AccessPoint;

import javax.ws.rs.core.Form;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UnifiAccessPoint extends UnifiBase implements AccessPoint {

    public UnifiAccessPoint() throws IOException {
    }

    @Override
    public Map getAll(String sessionId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);

        Map fullResponse = getData(sessionId, String.format("/api/s/%s/stat/device", siteInfo.get("name")), null);
        List<Map<String, Object>> allDevices = (List<Map<String, Object>>) fullResponse.get("data");
        List<String> assignedMacs = (List<String>) siteInfo.get("devices");

        List<Map<String, Object>> filteredDevices = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> device : allDevices){
            for(String mac : assignedMacs)
                if(device.get("mac").equals(mac))
                    filteredDevices.add(device);
        }

        fullResponse.put("data", filteredDevices);
        return fullResponse;
    }

    @Override
    public Map update(String sessionId, String deviceId, Form device) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/upd/device/%s", siteInfo.get("name"), deviceId), device);
    }
}
