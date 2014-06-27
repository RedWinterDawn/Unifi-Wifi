package com.jive.managedwifi.backup;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.joda.time.DateTime;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mock;

import com.google.common.collect.Lists;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.jive.managedwifi.modules.AmazonModule;
import com.jive.managedwifi.modules.UnifiModule;

public class IntegrationBackupTest {

	@Mock
	private AmazonSave amazonSave;

	@Ignore
	@Test
	public void stressIntegrationTest() throws IOException {

		final Injector injector = Guice.createInjector(new AmazonModule(),
				new UnifiModule());

		for (int i = 0; i < 25; i++) {
			final UnifiBackup backupUnifi = injector
					.getInstance(UnifiBackup.class);
			final AmazonSave amazonSave = injector
					.getInstance(AmazonSave.class);

			backupUnifi.unifiBackup();
			amazonSave.storeFile();
		}
	}

	@Ignore
	@Test
	public void keepLatestFile() throws IOException, InterruptedException {

		final List<File> files = Lists.newArrayList();

		for (int i = 0; i < 5; i++) {
			files.add(File.createTempFile(DateTime.now().toString(), ".unf"));
			Thread.sleep(3000);
		}

	}
}
