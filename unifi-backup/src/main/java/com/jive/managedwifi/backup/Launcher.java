package com.jive.managedwifi.backup;

import java.io.IOException;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.jive.managedwifi.modules.AmazonModule;
import com.jive.managedwifi.modules.UnifiModule;

public class Launcher {

	public static void main(String[] args) throws IOException {

		Injector injector = Guice.createInjector(new UnifiModule(), new AmazonModule());
		
		final UnifiBackup backupUnifi = injector.getInstance(UnifiBackup.class);
		final AmazonSave amazonSave = injector.getInstance(AmazonSave.class);
		
		backupUnifi.unifiBackup();
		amazonSave.StoreFile();		
	}
}
