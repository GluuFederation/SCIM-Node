#!/bin/bash

storepass=$1

# remove pkcs-cert.p12 file if exist
rm -f pkcs-cert.p12

# Importing keystore scim-rp.jks to pkcs-cert.p12
keytool -importkeystore -srcstorepass $storepass -storepass $storepass -srckeystore scim-rp.jks -destkeystore pkcs-cert.p12 -deststoretype PKCS12

# PKCS12 to plain private keys and save to private-keys.key
openssl pkcs12 -in pkcs-cert.p12 -nocerts -nodes -out private-keys.key -password pass:$storepass

# Get top first key id using some command tricks
echo '--------------------------------------------------------------------------------'
echo -n 'keyId: '
sed -n '2p' private-keys.key | awk '{print $2}'

# Get top first key's algorithm of the key using some command tricks
echo -n 'keyAlg: '
sed -n '2p' private-keys.key | awk '{print $2}' | grep -o '.....$' | tr '[:lower:]' '[:upper:]'

# Get top first Private Key and save into final-private-key.key file
start=`grep -n 'BEGIN PRIVATE KEY' private-keys.key | head -1 | awk -F  ":" '{print $1}'`
end=`grep -n 'END PRIVATE KEY' private-keys.key | head -1 | awk -F  ":" '{print $1}'`
sed -n $start','$end'p' "private-keys.key" > final-private-key.key
echo 'Saved key in final-private-key.key file. Use this file in scim-node configuration i.e. privateKey: "final-private-key.key"'
echo '--------------------------------------------------------------------------------'
