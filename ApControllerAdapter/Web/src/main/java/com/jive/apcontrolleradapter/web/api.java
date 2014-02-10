package com.jive.apcontrolleradapter.web;

import com.jive.apcontrolleradapter.JiveAuth;
import com.jive.apcontrolleradapter.unifi.*;

import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.Application;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

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
