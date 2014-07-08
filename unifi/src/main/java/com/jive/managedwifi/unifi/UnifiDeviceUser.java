package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.jive.managedwifi.webapi.DeviceUser;

public class UnifiDeviceUser extends UnifiBase implements DeviceUser {

	public UnifiDeviceUser() throws IOException {
	}

	@Override
	public Map getAll(final String sessionId, final String account,
			final String token) {
		final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
				account, token);
		final Map<String, Object> message = new HashMap<String, Object>();
		message.put("type", "all");
		message.put("is_offline", false);
		message.put("within", "144");
		return getData(sessionId,
				String.format("/api/s/%s/stat/alluser", siteInfo.get("name")),
				message, account, token);
	}

	@Override
	public Map getActive(final String sessionId, final String account,
			final String token) {
		final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
				account, token);
		return getData(sessionId,
				String.format("/api/s/%s/stat/sta", siteInfo.get("name")),
				null, account, token);
	}

}
