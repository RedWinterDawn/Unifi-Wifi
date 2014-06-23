package com.jive.managedwifi.backup;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.io.FilenameUtils;
import org.jclouds.blobstore.BlobStore;
import org.jclouds.blobstore.domain.Blob;

import com.google.inject.Inject;
import com.google.inject.name.Named;

@Slf4j
public class AmazonSave {
	
	private BlobStore blobStore;
	private String unifiPath;
	private String amazonPath;
	
	@Inject
	public AmazonSave(BlobStore blobStore, @Named("filesavepath") String unifiPath, @Named("path") String amazonPath){
		this.blobStore = blobStore;
		this.unifiPath = unifiPath;
		this.amazonPath = amazonPath;
	}

	public void StoreFile() throws FileNotFoundException {
		
		File file = new File(unifiPath);
		File[] filesInDir = file.listFiles(new FilenameFilter() {
			
			@Override
			public boolean accept(File dir, String name) {
				return FilenameUtils.getExtension(name).equals("unf");
			}
		});
		
		File backupFile = filesInDir[0];
		
		Blob blob = blobStore.blobBuilder(amazonPath+backupFile.getName())
                .payload(new FileInputStream(backupFile))
                .contentLength(backupFile.length())
                .build();
		
		blobStore.putBlob("jive-managed-wifi", blob);
		
		if(filesInDir[0].delete())
			log.debug("File was deleted");
	}
}
