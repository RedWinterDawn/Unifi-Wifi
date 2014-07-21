package com.jive.managedwifi.unifi;

import java.io.IOException;
import java.util.Map;

import com.jive.managedwifi.webapi.WlanNetwork;

public class UnifiWlanNetwork extends UnifiBase implements WlanNetwork
{

  public UnifiWlanNetwork() throws IOException
  {
  }

  @Override
  public Map getGroups(final String sessionId, final String account,
      final String token)
  {
    return getResponse(sessionId, "/api/s/%s/list/wlangroup", account,
        token);
  }

  @Override
  public Map createGroup(final String sessionId,
      final javax.ws.rs.core.Form networkGroup,
      final String account,
      final String token)
  {
    final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
        account, token);
    return postFormData(sessionId,
        String.format("/api/s/%s/add/wlangroup", siteInfo.get("name")),
        networkGroup);
  }

  @Override
  public Map getUserGroups(final String sessionId, final String account,
      final String token)
  {
    return getResponse(sessionId, "/api/s/%s/list/usergroup", account,
        token);
  }

  @Override
  public Map getNetworks(final String sessionId, final String account,
      final String token)
  {
    return getResponse(sessionId, "/api/s/%s/list/wlanconf", account, token);
  }

  @Override
  public Map addNetwork(final String sessionId,
      final javax.ws.rs.core.Form network, final String account,
      final String token)
  {
    final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
        account, token);
    return postFormData(sessionId,
        String.format("/api/s/%s/add/wlanconf", siteInfo.get("name")),
        network);
  }

  @Override
  public Map updateNetwork(final String sessionId, final String networkId,
      final javax.ws.rs.core.Form network, final String account,
      final String token)
  {
    final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
        account, token);
    return postFormData(sessionId, String.format(
        "/api/s/%s/upd/wlanconf/%s", siteInfo.get("name"), networkId),
        network);
  }

  @Override
  public Map deleteNetwork(final String sessionId, final String networkId,
      final String account, final String token)
  {
    final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
        account, token);
    return postFormData(sessionId, String.format(
        "/api/s/%s/del/wlanconf/%s", siteInfo.get("name"), networkId),
        null);
  }

  private Map getResponse(final String sessionId, final String uri,
      final String account, final String token)
  {
    final Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId,
        account, token);
    return getData(sessionId, String.format(uri, siteInfo.get("name")),
        null, account, token);
  }

}
