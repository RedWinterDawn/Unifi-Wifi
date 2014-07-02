package com.jive.managedwifi.unifi;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class MetaData {

	@JsonProperty("msg")
	public String msg;

	@JsonProperty("rc")
	public String rc;

}
