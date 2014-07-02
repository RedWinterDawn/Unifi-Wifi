package com.jive.managedwifi.unifi;

import java.util.List;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ResponseData {

	@JsonProperty("data")
	public String datas;

	@JsonProperty("meta")
	public List<MetaData> metas;
}
