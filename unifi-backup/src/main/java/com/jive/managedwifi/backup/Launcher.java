package com.jive.managedwifi.backup;

import java.io.IOException;

import com.google.inject.Guice;
import com.google.inject.Injector;

public class Launcher {

	public static void main(String[] args) throws IOException {

		Injector injector = Guice.createInjector(new BackupModule());
		
		Backup backup = injector.getInstance(Backup.class);
		
		backup.unifiBackup();
		
//		BlobStoreContext context = injector.getInstance(BlobStoreContext.class);
//		
//		InputStreamMap bucket = context.createInputStreamMap("jive-managed-wifi");
//
//		bucket.putFile("unifi_backups/unifi.unf", new File(args[0]));
//		
//		context.close();

	}
}
