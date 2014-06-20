package com.jive.managedwifi.modules;

import com.google.inject.AbstractModule;

public class MainModule extends AbstractModule {

	@Override
	protected void configure() {

		install(new UnifiModule());
		install(new AmazonModule());
	}

}
