package com.jive.managedwifi.modules;

import java.io.InputStream;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;

import org.jclouds.ContextBuilder;
import org.jclouds.aws.s3.AWSS3AsyncClient;
import org.jclouds.aws.s3.AWSS3Client;
import org.jclouds.aws.s3.blobstore.AWSS3BlobStoreContext;
import org.jclouds.blobstore.BlobStoreContext;
import org.jclouds.rest.RestContext;
import org.jclouds.s3.S3AsyncClient;
import org.jclouds.s3.S3Client;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.google.inject.name.Names;
import com.jive.managedwifi.backup.Launcher;

@Slf4j
public class AmazonModule extends AbstractModule {

	private BlobStoreContext blobContext;

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
	 /**
	    * so that we can inject RestContext<S3Client, S3AsyncClient>
	    */
	   @SuppressWarnings("unchecked")
	   @Singleton
	   @Provides
	   RestContext<S3Client, S3AsyncClient>
	provideBaseContext(RestContext<AWSS3Client, AWSS3AsyncClient> in) {
	      return (RestContext)in;
	   }

	@Provides
	public BlobStoreContext getContext(@Named("accessKey") String accessKey, @Named("secretKey") String secretKey,
			@Named("provider") String provider) {

		if (blobContext == null)
			this.blobContext = ContextBuilder.newBuilder(provider)
					.credentials(accessKey, secretKey)
					.buildView(AWSS3BlobStoreContext.class);
		
		return this.blobContext;
	}
}
