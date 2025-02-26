package com.jive.managedwifi.unifi;

import java.io.IOException;

import com.jive.managedwifi.Configuration;
import com.mongodb.MongoClient;

public class MongoDbClientFactory {
    private static MongoClient dbClient;

    public static MongoClient getDbClient() throws IOException {
        if(dbClient == null){
            dbClient = new MongoClient(Configuration.getMongoDBHost(), Configuration.getMongoDBPort());
        }
        return dbClient;
    }
}
