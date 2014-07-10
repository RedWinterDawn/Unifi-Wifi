package com.jive.managedwifi.modules;

import java.io.InputStream;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;

import org.jclouds.ContextBuilder;
import org.jclouds.blobstore.BlobStore;
import org.jclouds.blobstore.BlobStoreContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.Resources;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.name.Named;
import com.google.inject.name.Names;
import com.jive.jackson.ConstructorPropertiesAnnotationIntrospector;

@Slf4j
public class AmazonModule extends AbstractModule
{

  private BlobStore blobStore = null;

  @Override
  protected void configure()
  {

    final Properties prop = new Properties();
    InputStream input;
    try
    {
      input = Resources.getResource("aws.properties").openStream();

      prop.load(input);
    }
    catch (final Exception e)
    {
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

  @Provides
  public BlobStore getContext(@Named("accessKey") final String accessKey,
      @Named("secretKey") final String secretKey,
      @Named("provider") final String provider)
  {

    if (this.blobStore == null)
      this.blobStore = ContextBuilder.newBuilder(provider)
          .credentials(accessKey, secretKey)
          .buildView(BlobStoreContext.class).getBlobStore();

    return this.blobStore;
  }

  @Provides
  public ObjectMapper getMapper()
  {

    final ObjectMapper mapper = new ObjectMapper();
    ConstructorPropertiesAnnotationIntrospector.install(mapper);

    return mapper;
  }
}
