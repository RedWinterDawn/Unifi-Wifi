package com.jive.managedwifi.modules;

import java.io.InputStream;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;

import org.jclouds.ContextBuilder;
import org.jclouds.blobstore.BlobStore;
import org.jclouds.blobstore.BlobStoreContext;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.name.Named;
import com.google.inject.name.Names;
import com.jive.managedwifi.backup.Launcher;

@Slf4j
public class AmazonModule extends AbstractModule {

	private BlobStore blobStore;

	@Override
	protected void configure() {
		
		Properties prop = new Properties();
		InputStream input = Launcher.class.getClassLoader()
				.getResourceAsStream("aws.properties");
		try {
			prop.load(input);
		} catch (Exception e) {
			log.warn("Error loading aws.properties");
		}

		bind(String.class).annotatedWith(Names.named("secretKey")).toInstance(
				prop.getProperty("secretKey"));
		bind(String.class).annotatedWith(Names.named("accessKey")).toInstance(
				prop.getProperty("accessKey"));
		bind(String.class).annotatedWith(Names.named("provider")).toInstance(
				prop.getProperty("provider"));
		bind(String.class).annotatedWith(Names.named("path")).toInstance(
				prop.getProperty("path"));
	}
//	 /**
//	    * so that we can inject RestContext<S3Client, S3AsyncClient>
//	    */
//	   @SuppressWarnings("unchecked")
//	   @Singleton
//	   @Provides
//	   RestContext<S3Client, S3AsyncClient>
//	provideBaseContext(RestContext<AWSS3Client, AWSS3AsyncClient> in) {
//	      return (RestContext)in;
//	   }

	@Provides
	public BlobStore getContext(@Named("accessKey") String accessKey, @Named("secretKey") String secretKey,
			@Named("provider") String provider) {

		if (blobStore == null)
			this.blobStore = ContextBuilder.newBuilder(provider)
					.credentials(accessKey, secretKey)
					.buildView(BlobStoreContext.class).getBlobStore();
		
		return this.blobStore;
	}
}
