package com.jive.managedwifi.modules;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;

import com.google.common.io.Resources;
import com.google.inject.AbstractModule;
import com.google.inject.name.Names;

@Slf4j
public class UnifiModule extends AbstractModule
{

  @Override
  protected void configure()
  {

    final Properties prop = new Properties();
    InputStream input;
    try
    {
      input = Resources.getResource("unifi.properties").openStream();
      prop.load(input);
    }
    catch (final IOException e)
    {
      log.warn("Could not find unifi.properties");
    }

    bind(String.class).annotatedWith(Names.named("username")).toInstance(
        prop.getProperty("username"));
    bind(String.class).annotatedWith(Names.named("password")).toInstance(
        prop.getProperty("password"));
    bind(String.class).annotatedWith(Names.named("baseurl")).toInstance(
        prop.getProperty("baseurl"));
    bind(String.class).annotatedWith(Names.named("cookie")).toInstance(
        prop.getProperty("cookie"));
    bind(String.class).annotatedWith(Names.named("filesavepath"))
        .toInstance(prop.getProperty("filesavepath"));
    bind(String.class).annotatedWith(Names.named("days")).toInstance(
        prop.getProperty("days"));
  }

}
