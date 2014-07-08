package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.Form;

import com.jive.managedwifi.webapi.AccessPoint;

public class UnifiAccessPoint extends UnifiBase implements AccessPoint {

	public UnifiAccessPoint() throws IOException {
	}

	@Override
	public Map<String, List<Map<String, Object>>> getAll(
			final String sessionId, final String account, final String token) {
		final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
				account, token);

		final Map<String, List<Map<String, Object>>> fullResponse = getData(
				sessionId,
				String.format("/api/s/%s/stat/device", siteInfo.get("name")),
				null, account, token);
		final List<Map<String, Object>> allDevices = fullResponse.get("data");
		final List<String> assignedMacs = (List<String>) siteInfo
				.get("devices");

		final List<Map<String, Object>> filteredDevices = new ArrayList<Map<String, Object>>();

		if (assignedMacs != null) {
			for (final Map<String, Object> device : allDevices) {
				for (final String mac : assignedMacs)
					if (device.get("mac").equals(mac))
						filteredDevices.add(device);
			}
		}

		fullResponse.put("data", filteredDevices);
		return fullResponse;
	}

	@Override
	public Map update(final String sessionId, final String deviceId,
			final Form device, final String account, final String token) {
		final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
				account, token);
		return postFormData(sessionId, String.format("/api/s/%s/upd/device/%s",
				siteInfo.get("name"), deviceId), device);
	}
}
