package com.jive.managedwifi.backup;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.joda.time.DateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.io.CharStreams;
import com.google.inject.Inject;
import com.google.inject.name.Named;

@Slf4j
public class UnifiBackup
{

  private final String username;
  private final String password;
  private final String baseurl;
  private final String filesavepath;
  private final String days;
  private final List<String> baseArguments;
  private final ObjectMapper mapper;

  @Inject
  public UnifiBackup(final ObjectMapper mapper,
      @Named("cookie") final String cookie,
      @Named("username") final String username,
      @Named("password") final String password,
      @Named("baseurl") final String baseurl,
      @Named("filesavepath") final String filesavepath,
      @Named("days") final String days)
  {

    this.mapper = mapper;
    this.username = username;
    this.password = password;
    this.baseurl = baseurl;
    this.filesavepath = filesavepath;
    this.days = days;
    this.baseArguments = Lists.newArrayList("curl", "--sslv3", "--silent",
        "--cookie", cookie, "--cookie-jar", cookie, "--insecure");
  }

  public void unifiBackup() throws IOException
  {

    unifiLogin();
    final String backupFilePath = unifiGetFileToBackup();
    unifiSaveBackup(backupFilePath);
    unifiLogout();
  }

  private void unifiSaveBackup(final String backupFilePath)
      throws IOException
  {

    final List<String> arguments = Lists.newArrayList();
    arguments.addAll(baseArguments);
    arguments.add(baseurl + backupFilePath);
    arguments.add("-o");
    arguments.add(filesavepath
        + DateTime.now().toString("dd-MM-yyyy.HH:mm:ss") + ".unf");

    log.debug(arguments.toString());

    procCall(arguments);
  }

  private String unifiGetFileToBackup() throws IOException
  {

    final List<String> arguments = Lists.newArrayList();
    arguments.addAll(baseArguments);
    arguments.add("--data");
    arguments.add("json={'days':'" + days + "', 'cmd':'backup'}");
    arguments.add(baseurl + "/api/cmd/system");

    log.debug(arguments.toString());

    final String json = procCall(arguments);

    final BackupResponse response = mapper.readValue(json,
        BackupResponse.class);

    return response.getData().get(0).getUrl();
  }

  private void unifiLogin() throws IOException
  {

    final List<String> arguments = Lists.newArrayList();
    arguments.addAll(baseArguments);

    arguments.add("--data");
    arguments.add("login=login");
    arguments.add("--data");
    arguments.add("username=" + username);
    arguments.add("--data");
    arguments.add("password=" + password);
    arguments.add(baseurl + "/login");

    log.debug(arguments.toString());

    procCall(arguments);
  }

  private void unifiLogout() throws IOException
  {

    final List<String> arguments = Lists.newArrayList();
    arguments.addAll(baseArguments);

    arguments.add(baseurl + "/logout");

    log.debug(arguments.toString());

    procCall(arguments);
  }

  private String procCall(final List<String> arguments) throws IOException
  {

    final Process proc = new ProcessBuilder(arguments).redirectErrorStream(
        true).start();

    try
    {
      proc.waitFor();
    }
    catch (final InterruptedException e)
    {
      log.warn("login command interrupted {}", e);
    }

    final String result = CharStreams.toString(new InputStreamReader(proc
        .getInputStream()));

    log.debug(result);

    return result;
  }
}
