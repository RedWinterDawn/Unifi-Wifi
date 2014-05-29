package com.jive.apcontrolleradapter.unifi;

import com.jive.apcontrolleradapter.webapi.SiteSetting;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import javax.ws.rs.core.Form;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

public class UnifiSiteSetting extends UnifiBase implements SiteSetting {

    private String defaultTermsAndConditions = "By accessing the wireless network, you acknowledge that you're of legal age, you have read and understood and agree to be bound by this agreement\n" +
            "The wireless network service is provided by the property owners and is completely at their discretion. Your access to the network may be blocked, suspended, or terminated at any time for any reason.\n" +
            "You agree not to use the wireless network for any purpose that is unlawful and take full responsibility of your acts.\n" +
            "The wireless network is provided &quot;as is&quot; without warranties of any kind, either expressed or implied.";

    public UnifiSiteSetting() throws IOException {
    }

    @Override
    public Map getSetting(String sessionId) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        Map name = getData(sessionId, String.format("/api/s/%s/get/setting", siteInfo.get("name")), null);

        ArrayList<LinkedHashMap<String, String>> values = (ArrayList<LinkedHashMap<String, String>>) name.get("data");

        for (int i = 0; i < values.size(); i++) {
            LinkedHashMap<String, String> subValues = values.get(i);

            if (subValues.containsKey("auth")) {
                if (!subValues.containsKey("terms")) {
                    subValues.put("terms", defaultTermsAndConditions);
                }

                if (!subValues.containsKey("companyName")) {
                    subValues.put("companyName", "");
                }

                if (!subValues.containsKey("hotspotNoAuth")) {
                    subValues.put("hotspotNoAuth", "false");
                }
            }
        }

        return name;
    }

    @Override
    public Map updateSetting(String sessionId, Form settings) throws IOException {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/set/setting/guest_access", siteInfo.get("name")), settings);
    }

    @Override
    public String updateTou(String sessionId, Map form) throws IOException, InterruptedException {
        /*
        * Note to maintainers:
        *
        * This requires a couple of changes to visudo on the server:
        * 1. comment out:
        *     Defaults  requiretty
        * 2. root ALL=NOPASSWD: ALL
        */

         Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        String siteName = (String) siteInfo.get("name");
        String fileToReplace = "/opt/unifi/data/sites/" + siteName + "/portal/index.html";
        File file = new File(fileToReplace);

        String[] cmdSudo = {"/bin/bash","-c","sudo -s"};
        String[] cmd = {"/bin/bash","-c","sudo chmod -R 777 /usr/lib/unifi"};
        Process pbSudo = Runtime.getRuntime().exec(cmdSudo);
        pbSudo.waitFor();
        Process pb = Runtime.getRuntime().exec(cmd);
        pb.waitFor();
        String line;
        String output = "";
        BufferedReader input = new BufferedReader(new InputStreamReader(pb.getInputStream()));
        while ((line = input.readLine()) != null) {
            output += line;
        }
        String outErr = "";
        BufferedReader inputErr = new BufferedReader(new InputStreamReader(pb.getErrorStream()));
        while ((line = inputErr.readLine()) != null) {
            outErr += line;
        }
        input.close();
        inputErr.close();

        String deleted = "true";
        if (file.exists()) {
            try {
                file.delete();
            } catch (Exception e) {
                deleted = "false";
            }
        }

        String html = IOUtils.toString(Thread.currentThread().getContextClassLoader().getResourceAsStream("template.txt"));
        String company = (String)form.get("company");
        if (!company.equals("")) company += " ";
        html = html.replace("%TERMS%", (String)form.get("terms"));
        html = html.replace("%COMPANY%", company);

        String wrote = "true";
        try {
            FileUtils.writeStringToFile(new File(fileToReplace), html);
        } catch (Exception e) {
            wrote = "false";
        }

        return "deleted: " + deleted + " wrote: " + wrote + " log: " + output + outErr;
    }

    @Override
    public Map updateLimits(String sessionId, String userGroupId, Form limits) {
        Map<String, Object> siteInfo = getExtendedSiteInfo(sessionId);
        return postFormData(sessionId, String.format("/api/s/%s/upd/usergroup/%s", siteInfo.get("name"), userGroupId), limits);
    }
}
