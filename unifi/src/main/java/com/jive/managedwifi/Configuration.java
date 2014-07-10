package com.jive.managedwifi;

import java.io.File;
import java.io.FileInputStream;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Configuration
{

  private static final Configuration INSTANCE;

  static
  {
    INSTANCE = new Configuration("/etc/managed-wifi.config");
    logConfiguration();
  }

  private final Properties properties = new Properties();

  private Configuration(final String filename)
  {
    try (FileInputStream fileInputStream = new FileInputStream(new File(
        filename)))
    {
      properties.load(fileInputStream);
    }
    catch (final Exception e)
    {
      log.error("Could not load configuration", e);
    }
  }

  private static void logConfiguration()
  {
    log.info("CONFIGURATION");
    log.info("web.CORS.origin={}", getHostForCORSFilter());
    log.info("unifi.controller.URL={}", getControllerURL());
    log.info("mongo.host={}", getMongoDBHost());
    log.info("mongo.port={}", getMongoDBPort());
    log.info("smtp.host={}", getAlertMailSMTPHost());
    log.info("alert.message.from={}", getAlertMailFrom());
    log.info("alert.message.subject={}", getAlertMailSubject());
    log.info("alert.message.template={}", getAlertMailMessageTemplate());
    log.info("oauth.URL={}", getOAuthURL());
    log.info("oauth.redirectURI={}", getOAuthRedirectURI());
    log.info("oauth.clientId={}", getOAuthClientID());
    log.info("oauth.password={}", getOAuthPassword());
    log.info("portal-api.URL={}", getPortalAPIBaseURL());
  }

  public static String getHostForCORSFilter()
  {
    return INSTANCE.properties.getProperty("web.CORS.origin",
        "http://localhost:8000");
  }

  public static String getControllerURL()
  {
    return INSTANCE.properties.getProperty("unifi.controller.URL",
        "https://localhost:8443");
  }

  public static String getMongoDBHost()
  {
    return INSTANCE.properties.getProperty("mongo.host", "127.0.0.1");
  }

  public static int getMongoDBPort()
  {
    return Integer.valueOf(INSTANCE.properties.getProperty("mongo.port",
        "27017"));
  }

  public static String getAlertMailSMTPHost()
  {
    return INSTANCE.properties.getProperty("smtp.host", "mail");
  }

  public static String getAlertMailFrom()
  {
    return INSTANCE.properties.getProperty("alert.message.from",
        "noreply@jive.com");
  }

  public static String getAlertMailSubject()
  {
    return INSTANCE.properties.getProperty("alert.message.subject",
        "Jive Wifi Alert");
  }

  public static String getAlertMailMessageTemplate()
  {
    return INSTANCE.properties.getProperty("alert.message.template",
        "Access point: {0}, from {1} has been {2}");
  }

  public static String getOAuthURL()
  {
    return INSTANCE.properties.getProperty("oauth.URL",
        "https://auth.jive.com/oauth2/v2");
  }

  public static String getOAuthRedirectURI()
  {
    return INSTANCE.properties.getProperty("oauth.redirectURI",
        "http://localhost:8000/index.html#/oauth2/v2");
  }

  public static String getOAuthClientID()
  {
    return INSTANCE.properties.getProperty("oauth.clientId",
        "27abd5a4-9e81-4e4e-9ccf-f6e81df64d19");
  }

  public static String getOAuthPassword()
  {
    return INSTANCE.properties.getProperty("oauth.password",
        "i4egS4Cd59LWJiP6SnafL7nvJjg7cI");
  }

  public static String getPortalAPIBaseURL()
  {
    return INSTANCE.properties.getProperty("portal-api.URL",
        "https://api.jive.com/wifi");
  }

}
