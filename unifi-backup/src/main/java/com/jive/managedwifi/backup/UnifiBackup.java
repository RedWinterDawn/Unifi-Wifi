package com.jive.managedwifi.backup;

import java.io.IOException;
import java.io.StringWriter;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.io.IOUtils;
import org.joda.time.DateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.name.Named;

@Slf4j
public class UnifiBackup {

	private String username;
	private String password;
	private String baseurl;
	private String filesavepath;
	private String days;
	private List<String> baseArguments;

	@Inject
	public UnifiBackup(@Named("cookie") String cookie,
			@Named("username") String username,
			@Named("password") String password,
			@Named("baseurl") String baseurl,
			@Named("filesavepath") String filesavepath,
			@Named("days") String days) {

		this.username = username;
		this.password = password;
		this.baseurl = baseurl;
		this.filesavepath = filesavepath;
		this.days = days;
		this.baseArguments = Lists.newArrayList("curl", "--sslv3", "--silent",
				"--cookie", cookie, "--cookie-jar", cookie, "--insecure");
	}

	public void unifiBackup() throws IOException {

		unifiLogin();
		String backupFilePath = unifiGetFileToBackup();
		unifiSaveBackup(backupFilePath);
		unifiLogout();
	}

	private void unifiSaveBackup(String backupFilePath) throws IOException {

		List<String> arguments = Lists.newArrayList();
		arguments.addAll(baseArguments);
		arguments.add(baseurl + backupFilePath);
		arguments.add("-o");
		arguments.add(filesavepath + DateTime.now().toString() + ".unf");

		log.debug(arguments.toString());

		procCall(arguments);
	}

	private String unifiGetFileToBackup() throws IOException {

		List<String> arguments = Lists.newArrayList();
		arguments.addAll(baseArguments);
		arguments.add("--data");
		arguments.add("json={'days':'"+days+"', 'cmd':'backup'}");
		arguments.add(baseurl + "/api/cmd/system");

		log.debug(arguments.toString());

		String json = procCall(arguments);

		ObjectMapper mapper = new ObjectMapper();
		BackupResponse response = mapper.readValue(json, BackupResponse.class);
		
		
		return response.getData().get(0).getUrl();
	}

	private void unifiLogin() throws IOException {

		List<String> arguments = Lists.newArrayList();
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

	private void unifiLogout() throws IOException {

		List<String> arguments = Lists.newArrayList();
		arguments.addAll(baseArguments);

		arguments.add(baseurl + "/logout");

		log.debug(arguments.toString());

		procCall(arguments);
	}

	private String procCall(List<String> arguments) throws IOException {

		Process proc = new ProcessBuilder(arguments).redirectErrorStream(true)
				.start();

		try {
			proc.waitFor();
		} catch (InterruptedException e) {
			log.warn("login command interrupted {}", e);
		}

		StringWriter writer = new StringWriter();
		IOUtils.copy(proc.getInputStream(), writer);

		log.debug(writer.toString());

		return writer.toString();
	}
}
