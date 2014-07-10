package com.jive.managedwifi.backup;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;

import lombok.extern.slf4j.Slf4j;

import org.jclouds.blobstore.BlobStore;
import org.jclouds.blobstore.domain.Blob;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import com.google.common.io.Files;
import com.google.inject.Inject;
import com.google.inject.name.Named;

@Slf4j
public class AmazonSave
{

  private final BlobStore blobStore;
  private final String unifiPath;
  private final String amazonPath;
  private final DateTimeFormatter formatter = DateTimeFormat
      .forPattern("dd-MM-yyyy.HH:mm:ss");

  @Inject
  public AmazonSave(final BlobStore blobStore,
      @Named("filesavepath") final String unifiPath,
      @Named("path") final String amazonPath)
  {
    this.blobStore = blobStore;
    this.unifiPath = unifiPath;
    this.amazonPath = amazonPath;
  }

  // Return lastest backup by date
  private File compareFiles(final File file1, final File file2)
  {

    final Instant fileTime1 = formatter.parseDateTime(
        Files.getNameWithoutExtension(file1.getName())).toInstant();

    final Instant fileTime2 = formatter.parseDateTime(
        Files.getNameWithoutExtension(file2.getName())).toInstant();

    if (fileTime1.isBefore(fileTime2))
    {
      file1.delete();
      return file2;
    }
    file2.delete();
    return file1;

  }

  public void storeFile()
  {

    // Get all .unf files in dir
    final File[] filesInDir = new File(unifiPath)
        .listFiles(new FilenameFilter()
        {

          @Override
          public boolean accept(final File dir, final String name)
          {
            return Files.getFileExtension(name).equals("unf");
          }
        });

    File backupFile = filesInDir[0];

    // Delete all files not the latest backup
    for (int i = 1; i < filesInDir.length; i++)
    {
      backupFile = compareFiles(filesInDir[i], backupFile);
    }

    Blob blob = null;
    try
    {
      blob = blobStore.blobBuilder(amazonPath + backupFile.getName())
          .payload(new FileInputStream(backupFile))
          .contentLength(backupFile.length()).build();
    }
    catch (final FileNotFoundException e)
    {
      log.debug("{} not found", backupFile);
    }

    if (blob != null)
    {
      log.debug("Blob was stored");
      blobStore.putBlob("jive-managed-wifi", blob);
    }

  }
}
