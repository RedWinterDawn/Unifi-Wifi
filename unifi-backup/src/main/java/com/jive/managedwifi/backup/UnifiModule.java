package com.jive.managedwifi.backup;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;

import com.google.inject.AbstractModule;
import com.google.inject.name.Names;

@Slf4j
public class UnifiModule extends AbstractModule {

	@Override
	protected void configure() {
		
		Properties prop = new Properties();
		InputStream input = Launcher.class.getClassLoader().getResourceAsStream("unifi.properties");
		
		try {
			prop.load(input);
		} catch (IOException e) {
			log.warn("Could not find unifi.properties");
		}
		
		bind(String.class).annotatedWith(Names.named("username")).toInstance(prop.getProperty("username"));
		bind(String.class).annotatedWith(Names.named("password")).toInstance(prop.getProperty("password"));
		bind(String.class).annotatedWith(Names.named("baseurl")).toInstance(prop.getProperty("baseurl"));
		bind(String.class).annotatedWith(Names.named("cookie")).toInstance(prop.getProperty("cookie"));
		bind(String.class).annotatedWith(Names.named("filesavepath")).toInstance(prop.getProperty("filesavepath"));
		bind(String.class).annotatedWith(Names.named("days")).toInstance(prop.getProperty("days"));
	}

}
