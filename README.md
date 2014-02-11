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




