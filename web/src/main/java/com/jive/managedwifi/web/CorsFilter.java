package com.jive.managedwifi.web;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.ext.Provider;

@Provider
public class CorsFilter implements ContainerResponseFilter
{

  private final Properties props;

  public CorsFilter() throws IOException
  {
    props = new Properties();
    props.load(getClass().getClassLoader().getResourceAsStream("web.properties"));
  }

  @Override
  public void filter(final ContainerRequestContext requestCtx,
      final ContainerResponseContext responseCtx)
      throws IOException
  {
    responseCtx.getHeaders().add("Access-Control-Allow-Origin", props.getProperty("uihost"));
    responseCtx.getHeaders().add("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
    final List<String> reqHead = requestCtx.getHeaders().get("Access-Control-Request-Headers");
    if (null != reqHead)
      responseCtx.getHeaders().put("Access-Control-Allow-Headers", new ArrayList<Object>(reqHead));
  }
}
