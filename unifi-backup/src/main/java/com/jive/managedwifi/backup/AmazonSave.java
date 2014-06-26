package com.jive.managedwifi.backup;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;

import lombok.extern.slf4j.Slf4j;

import org.jclouds.blobstore.BlobStore;
import org.jclouds.blobstore.domain.Blob;

import com.google.common.io.Files;
import com.google.inject.Inject;
import com.google.inject.name.Named;

@Slf4j
public class AmazonSave {

	private final BlobStore blobStore;
	private final String unifiPath;
	private final String amazonPath;

	@Inject
	public AmazonSave(final BlobStore blobStore,
			@Named("filesavepath") final String unifiPath,
			@Named("path") final String amazonPath) {
		this.blobStore = blobStore;
		this.unifiPath = unifiPath;
		this.amazonPath = amazonPath;
	}

	public void StoreFile() {

		// Find unifi backup file
		final File file = new File(unifiPath);
		final File[] filesInDir = file.listFiles(new FilenameFilter() {

			@Override
			public boolean accept(final File dir, final String name) {
				return Files.getFileExtension(name).equals("unf");
			}
		});

		final File backupFile = filesInDir[0];

		Blob blob = null;
		try {
			blob = blobStore.blobBuilder(amazonPath + backupFile.getName())
					.payload(new FileInputStream(backupFile))
					.contentLength(backupFile.length()).build();
		} catch (final FileNotFoundException e) {
			log.debug("{} not found", backupFile);
		}

		if (blob != null) {
			log.debug("Blob was stored");
			blobStore.putBlob("jive-managed-wifi", blob);
		}

		if (filesInDir.length > 1)
			if (filesInDir[filesInDir.length - 1].delete())
				log.debug("File was deleted");
	}
}
