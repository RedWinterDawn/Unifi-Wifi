#!/bin/sh

username=admin
password=Jive123
baseurl=https://localhost:8443
cookie=/tmp/unifi_cookie
output=/usr/lib/unifi_backup/`date +%Y%m%d%H%M`.unf

curl_cmd="curl --sslv3 --silent --cookie ${cookie} --cookie-jar ${cookie} --insecure "

# authenticate against unifi controller
${curl_cmd} --data "login=login" --data "username=$username" --data "password=$password" $baseurl/login

# ask controller to do a backup, response contains the path to the backup file
path=`$curl_cmd --data "json={'cmd':'backup'}" $baseurl/api/cmd/system | sed -n 's/.*\(\/dl.*unf\).*/\1/p'`

# download the backup to the destinated output file
$curl_cmd $baseurl$path -o $output

# logout
${curl_cmd} $baseurl/logout

exit 0