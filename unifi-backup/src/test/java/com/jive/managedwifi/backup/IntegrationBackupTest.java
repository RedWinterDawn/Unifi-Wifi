package com.jive.managedwifi.backup;

import java.io.IOException;

import org.junit.Ignore;
import org.junit.Test;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.jive.managedwifi.modules.MainModule;

public class IntegrationBackupTest {

	@Ignore
	@Test
	public void stressIntegrationTest() throws IOException {

		Injector injector = Guice.createInjector(new MainModule());

		for (int i = 0; i < 25; i++) {
			final UnifiBackup backupUnifi = injector
					.getInstance(UnifiBackup.class);
			final AmazonSave amazonSave = injector
					.getInstance(AmazonSave.class);

			backupUnifi.unifiBackup();
			amazonSave.StoreFile();
		}

	}
}
