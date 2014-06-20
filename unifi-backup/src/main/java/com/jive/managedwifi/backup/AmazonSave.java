package com.jive.managedwifi.backup;

import java.io.File;
import java.io.FilenameFilter;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.io.FilenameUtils;
import org.jclouds.blobstore.BlobStoreContext;
import org.jclouds.blobstore.InputStreamMap;

import com.google.inject.Guice;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.name.Named;
import com.jive.managedwifi.modules.AmazonModule;

@Slf4j
public class AmazonSave {
	
	private Injector injector;
	private String unifiPath;
	private String amazonPath;
	
	@Inject
	public AmazonSave(@Named("filesavepath") String unifiPath, @Named("path") String amazonPath){
		this.injector = Guice.createInjector(new AmazonModule());
		this.unifiPath = unifiPath;
		this.amazonPath = amazonPath;
	}

	public void StoreFile() {

		BlobStoreContext context = injector.getInstance(BlobStoreContext.class);
		
		InputStreamMap bucket = context.createInputStreamMap("jive-managed-wifi");
		
		File file = new File(unifiPath);
		File[] filesInDir = file.listFiles(new FilenameFilter() {
			
			@Override
			public boolean accept(File dir, String name) {
				return FilenameUtils.getExtension(name).equals("unf");
			}
		});

		bucket.putFile(amazonPath+filesInDir[0].getName(), new File(filesInDir[0].toString()));
		
		if(filesInDir[0].delete())
			log.debug("File was deleted");
		
		context.close();
	}
}
