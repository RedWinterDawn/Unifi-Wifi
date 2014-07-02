package com.jive.managedwifi.web;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.core.Application;

import com.jive.managedwifi.JiveAuth;
import com.jive.managedwifi.unifi.UnifiAccessPoint;
import com.jive.managedwifi.unifi.UnifiCmd;
import com.jive.managedwifi.unifi.UnifiDeviceUser;
import com.jive.managedwifi.unifi.UnifiLogin;
import com.jive.managedwifi.unifi.UnifiSite;
import com.jive.managedwifi.unifi.UnifiSiteSetting;
import com.jive.managedwifi.unifi.UnifiWlanNetwork;

public class api extends Application {
    private static final Set<Class<?>> CLASSES;
    static {
        HashSet<Class<?>> tmp = new HashSet<Class<?>>();
        tmp.add(UnifiAccessPoint.class);
        tmp.add(UnifiDeviceUser.class);
        tmp.add(UnifiWlanNetwork.class);
        tmp.add(UnifiSiteSetting.class);
        tmp.add(UnifiSite.class);
        tmp.add(UnifiCmd.class);
        tmp.add(UnifiLogin.class);
        tmp.add(JiveAuth.class);
        tmp.add(CorsFilter.class);

        CLASSES = Collections.unmodifiableSet(tmp);
    }

    @Override
    public Set<Class<?>> getClasses() {
        return CLASSES;
    }

}
