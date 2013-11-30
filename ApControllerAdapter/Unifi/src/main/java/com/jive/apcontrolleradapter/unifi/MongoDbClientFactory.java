package com.jive.apcontrolleradapter.unifi;

import com.mongodb.MongoClient;

import java.io.IOException;
import java.util.Properties;

public class MongoDbClientFactory {
    private static MongoClient dbClient;

    public static MongoClient getDbClient() throws IOException {
        if(dbClient == null){
            Properties prop = new Properties();
            ClassLoader classLoader = MongoDbClientFactory.class.getClassLoader();
            prop.load(classLoader.getResourceAsStream("/com/jive/apcontrolleradapter/unifi/unifi.properties"));
            dbClient = new MongoClient(prop.getProperty("mongoDbHost"), Integer.parseInt(prop.getProperty("mongoDbPort")));
        }
        return dbClient;
    }
}
