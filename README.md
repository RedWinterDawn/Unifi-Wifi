Managed-Wifi
============
A managed wifi control panel for distributed management if wireless access points. Key function include:
* Site-based. Wireless access points are associated and managed per site
* Multi-tenant and multi-site per tenant. A site is a logical container for configurations and access points.
* Manage networks
* Mange access points
* Manage users
* Manage guest/user access
* Reporting on traffic activity
* Rich and responsive UI

UI Design
=========
The application is composed of a SPA (single-page application) and a web service.

The UI utilizes Angularjs and a modified Bootstrap template. The UI is solely composed of html, css, js. No server-side HTML framework was used. As a result, the UI could be hosted anywhere, even a CDN.

The UI has an implementation that is specific for Unifi. The goal was to introduce the service abstraction in the UI. This allowed for testing with mocks and to communicate directly to other services without the need for a server proxy.


Unifi Proxy
===========
A Unifi proxy is required to introduce two items:
* Multi-tenant. Unifi, out of the box, provides multi-site, but has no notion of a tenant or account.
* Additional security, due to multi-tenancy

The Unifi proxy is a REST-based web service implemented using RESTEasy. The goal for this was to delegate to the Unifi controller as much as possible and only introduce change where necessary. This would enable an easier upgrade path when the Unifi controller is updated. It also reduces the complexity of the app, less code = less things to manage or break. Where changes were needed, they only add to the existing set of services and database collections in the Unifi Controller.


Unifi Controller
================
The Unifi controller is an out-of-box management portal and set of web services. To enable multi-site support, version 3.0 of the Unifi controller is necessary (currently in beta). The controller is a J2EE app utilizing a MongoDB database.


Deployment Considerations
=========================
Depending on where and how the UI is hosted, CORS may need to be setup for the proxy. Included in the webapi is a CORS filter, just edit the properties file for the UI host.

You must use SSL as the Unifi Controller requires it. If you use a signed cert from a trusted authority and you should be fine.

You have several ways to host this app. It is comprised of 3 parts (the UI, the Unifi proxy, and the Unifi controller) which can be hosted on the same machine or different one. For the UI, this could even be hosted within the process running the Unifi controller or proxy (which was done in UAT). This offers various approaches to scaling as each can be scaled as needed. The UI and proxy are the easiest to scale out as they require no further consideration. Fo the Unifi controller, a solution for scaling the DB is needed. Since it is MongoDB and the design of the controller is to use a local instance (this can't be changed), that leaves only one approach to scaling which is to utilize Master-to-Master replication.

The UI references a LOT of files. A method of bundling, minimizing and referencing that bundle could be part of the deployment process.

The Unifi proxy supports email notifications to an email address (per site) in the event of access point failures. To support this a custom service was written to poll the database and send out emails. There is an "email-alerts" endpoints that should be hit on a regular schedule. Pass in the interval (in seconds) of the recurrence. This will grab the events that fall within the previous X seconds and send the emails.


Authentication
==============
The app integrates with the Jive Oauth provider. ALL links pointing to this app should pass in the pbxid. For example:
https://unifi.emarkit.com:8443/ManagedWifi/app/?pbxid=01436dbd-14f9-3bde-437e-006300420001


Multi-Tenant and Site Management
================================
A tenant is defined solely by the pbxid. The pbxid is passed into the app.

For "Platform-Admin" users, they will be able to add sites to this pbxid. If no sites exist, the UI will essentially be locked-down and direct the user to create the first site. Once the first site is created, you will see the expected navigational tabs for networks/users/devices...etc.

For non-platform-admin users, the passed in pbxid will be validated against the list of pbxids associated with that user. If none exist, the user will not be allowed into the app. If one does and no sites exist for that pbx, a message describing the specific situation will display to the user and they will not be allowed into the app until at least one site is setup. If a site(s) is set-up, the user will be allowed into the app and will only have access to the sites associated with the pbx.

In order to automatically provision an access point to a specific site, the MAC addresses of the access points for a particular site will need to be provided to the application. This is done under the Site Settings for the site.

Deploy New Fresh Instance
================================
This is only for production and is not formatted the best. Be wary of what follows a little.

Spin up an AWS instance using the jive-el6-v8 AMI according to the standard devops procedure

SSH into the AWS instance and set the default gateway to the correct nat

run yum install tomcat6 

in vim /etc/tomcat6/server.xml change the http connector to port 9080

add 127.0.0.1 unifi to /etc/hosts

export JAVA_HOME=/usr/lib/jvm/jre-1.7.0-openjdk.x86_64/

create the file Create a /etc/yum.repos.d/mongodb.repo

contents of file :
[mongodb]
name=MongoDB Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
gpgcheck=0
enabled=1

run: yum install mongo-10gen mongo-10gen-server

###One Way
scp the Unifi Controller software version 3.1.3
NOTE: The version must be 3.1.3 at this time no other version is supported by the UI

unzip the file e.g.: unzip UniFi.unix.zip

mv UniFi unifi

mv unifi /opt/

cd /opt/unifi/
NOTE: /opt/unfi/bin/mongod needs to symlink to the installed mongod (usally /usr/bin/mongod)

java -jar lib/ace.jar start &
NOTE: needs to have the `&` to start in the background

####Another Way - using debian pkg
https://community.ubnt.com/t5/UniFi-Beta/UniFi-3-1-10-RC-is-Released/m-p/739939#U739939
Near the bottom are instructions

go to https://<ipaddess>:8443

setup the unifi controller
username: admin
password: Jive123

all other info not important set to whatever

```
echo |openssl s_client -connect localhost:8443 2>&1 |sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' |keytool -import -trustcacerts -alias "managed wifi controller"   -keystore "$JAVA_HOME/jre/lib/security/cacerts"   -storepass changeit -noprompt
```

expect: `Certificate was added to the keystore`

`cd /var/lib/tomcat6/webapps/`

Pull latest snapshot from the Nexus repo. Search for: com.jive.apcontrolleradapter
```
wget "http://repo.ftw.jiveip.net/service/local/artifact/maven/redirect?r=snapshots&g=com.jive.apcontrolleradapter&a=web&v=1.0-SNAPSHOT&e=war"
```
Rename the downloaded file. If there already exists a folder named ROOT, remove it.
```
mv <downloaded file> ROOT.war
```
create file /etc/managed-wifi.config

contents of file:
```
web.CORS.origin=https://wifi.jive.com

unifi.controller.URL=https://unifi:8443

mongo.host=localhost
mongo.port=27117
smtp.host=mail
alert.message.from=noreply@jive.com
alert.message.subject=Jive Wifi Alert
alert.message.template=Access point: {0}, from {1} has been {2}
oauth.URL=https://auth.jive.com/oauth2
oauth.redirectURI=https://wifi.jive.com/index.html#/oauth2
oauth.clientId=27abd5a4-9e81-4e4e-9ccf-f6e81df64d19
oauth.password=i4egS4Cd59LWJiP6SnafL7nvJjg7cI
portal-api.URL=https://api.jive.com/wifi
```
Start tomcat
```
service tomcat6 start
```
to verify tomcat started properly by running tail on the logs.
```
tail -f path/to/tomcat/files
```
path is usually ```/usr/lib/tomcat/logs/catalina.out```


# Getting the bastard running
The process to get Managed Wifi up and running is slightly involved. The steps here might not be complete, so if you figure something out, PLEASE add it to the README.


Add the following line to `/etc/hosts`
```
10.120.255.70 unifi
```

Make sure that you're using JRE 1.7.0 at the very least.

Go to `unifi:8080`. This will redirect you to the unifi login page.
username: `admin`
password: `Jive123`

Run the following to get the unifi SSL cert trusted
```
echo | openssl s_client -connect unifi:8443 2>&1 |sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' | sudo keytool -import -trustcacerts -alias "managed wifi controller"   -keystore "$JAVA_HOME/jre/lib/security/cacerts"   -storepass changeit -noprompt
```

It should output `Certificate was added to the keystore`

If you get the error that you already have a key name < managed wifi controller >, simply change the name to whatever in the command.

create file /etc/managed-wifi.config with the contents like so:

```
#web.CORS.origin=https://wifi.jive.com
unifi.controller.URL=https://unifi:8443

mongo.host=localhost
mongo.port=27117

smtp.host=mail

alert.message.from=noreply@jive.com
alert.message.subject=Jive Wifi Alert
alert.message.template=Access point: {0}, from {1} has been {2}

oauth.URL=https://auth.jive.com/oauth2
#oauth.redirectURI=https://wifi.jive.com/index.html#/oauth2
oauth.clientId=27abd5a4-9e81-4e4e-9ccf-f6e81df64d19
oauth.password=i4egS4Cd59LWJiP6SnafL7nvJjg7cI

portal-api.URL=https://api.jive.com/wifi
```

Next, you have to set up an SSH tunnel to the managed wifi Mongo DB on the Unifi host. Your public key needs to added to the server (talk to devops):
```
ssh admin@172.20.9.70 -L 27117:localhost:27117
```

You should now be able to start the server in Eclipse (you have to make a Tomcat server for it). Then, you might be able to go to http://localhost:8000/index.html?pbxid=0127d974-f9f3-0704-2dee-000100420001#/oauth2


Good luck.
