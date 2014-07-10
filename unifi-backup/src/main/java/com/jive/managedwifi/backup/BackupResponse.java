package com.jive.managedwifi.backup;

import java.util.List;

import lombok.Value;

@Value
public class BackupResponse
{

  private List<Datas> data;

  public Datas meta;
}
