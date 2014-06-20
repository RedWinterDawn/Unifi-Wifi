package com.jive.managedwifi.backup;

import java.io.IOException;
import java.io.StringWriter;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.io.IOUtils;
import org.joda.time.DateTime;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.name.Named;

@Slf4j
public class Backup {

	private String username;
	private String password;
	private String baseurl;
	private String filesavepath;
	private String days;
	private List<String> baseArguments;

	@Inject
	public Backup(@Named("cookie") String cookie,
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

		procCall(arguments);
	}

	private String unifiGetFileToBackup() throws IOException {

		List<String> arguments = Lists.newArrayList();
		arguments.addAll(baseArguments);
		arguments.add("--data");
		arguments.add("json={'days':'" + days + "' 'cmd':'backup'}");
		arguments.add(baseurl + "/api/cmd/system");

		String json = procCall(arguments);
		String path = "";

		JSONObject jsonObject = null;

		try {
			jsonObject = new JSONObject(json);
			jsonObject = new JSONObject(jsonObject.getJSONArray("data").get(0)
					.toString());
			path = jsonObject.getString("url");
		} catch (JSONException e) {
			log.warn("Error in building jsonobject from unifi response {}", e);
		}

		return path;
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

		procCall(arguments);
	}

	private void unifiLogout() throws IOException {

		List<String> arguments = Lists.newArrayList();
		arguments.addAll(baseArguments);

		arguments.add(baseurl + "/logout");

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
