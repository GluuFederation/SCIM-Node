'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // For self-signed certificate.

var config = {
  keyAlg: 'XXXXX', // Algorithm type.
  domain: 'https://example.com/', // Gluu server URL.
  privateKey: 'value', // Value can be buffer or path of private key.
  clientId: '@!XXXX.XXXX.XXXX.XXXX!XXXX!XXXX.XXXX!XXXX!XXXX.XXXX', // UMA client id.
  keyId: '000xx0x0-xx00-00xx-xx00-0x000x0x000x', // oxAuth JWKS key id.
};

var scim = require('./index')(config);

/**
 * There are 2 ways to process the response of every methods.
 * 1) Using callback function.
 * 2) Using promise. Do not pass callback function in argument.
 */

// region "getUsersCount": To get total count of users.

// Process data or handle error in callback function.
scim.getUsersCount(callback);
function callback(error, data) {
  if (error) {
    // Handle error here.
  } else {
    // Process data here.
  }
}
// Process data or handle error using promise.
scim.getUsersCount().then(function (data) {
  // Process data here.
}).catch(function (error) {
  // Handle error here.
});
// endregion

// region "getUsers": To get collection of users.
// "startIndex" is page index.
// "count" is number of users to be returned.
scim.getUsers(startIndex, count, callback);
// endregion

// region "getUser": To get user object using id attribute of type inum.
// "id" is inum of user.
scim.getUser(id, callback);
// endregion

// region "addUser": To insert new user to SCIM.
// 'userSampleData' can be object or json ('username' attribute is required. 'meta' attribute is readonly).
var userSampleData =
  {
    'externalId': 'scimTest',
    'userName': 'test',
    'name': {
      'givenName': 'json',
      'familyName': 'json',
      'middleName': 'N/A',
      'honorificPrefix': 'N/A',
      'honorificSuffix': 'N/A'
    },
    'displayName': 'json json',
    'nickName': 'json',
    'profileUrl': 'http://www.gluu.org/',
    'emails': [{
      'value': 'json@gluu.org',
      'type': 'work',
      'primary': 'true'
    }, {
      'value': 'json2@gluu.org',
      'type': 'home',
      'primary': 'false'
    }
    ],
    'addresses': [{
      'type': 'work',
      'streetAddress': 'street 1 address',
      'locality': 'Austin',
      'region': 'TX',
      'postalCode': '78701',
      'country': 'US',
      'formatted': 'street 1 address Austin , TX 78701 US',
      'primary': 'true'
    }
    ],
    'phoneNumbers': [{
      'value': '000-000-0000',
      'type': 'work'
    }
    ],
    'ims': [{
      'value': 'test_user',
      'type': 'Skype'
    }
    ],
    'userType': 'CEO',
    'title': 'CEO',
    'preferredLanguage': 'en-us',
    'locale': 'en_US',
    'active': 'true',
    'password': 'passw0rd',
    'roles': [{
      'value': 'Owner'
    }
    ],
    'entitlements': [{
      'value': 'full access'
    }
    ],
    'x509Certificates': [{
      'value': 'MIIDQzCCAqygAwIBAgICEAAxxxx00000xx000QEFBQAwTjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFDASBgNVBAoMC2V4YW1wbGUuY29tMRQwEgYDVQQDDAtleGFtcGxlLmNvbTAeFw0xMTEwMjIwNjI0MzFaFw0xMjEwMDQwNjI0MzFa MH8xCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRQwEgYDVQQKDAtleGFtcGxlLmNvbTEhMB8GA1UEAwwYTXMuIEJhcmJhcmEgSiBKZW5zZW4gSUlJMSIwIAYJKoZIhvcNAQkBFhNiamVuc2VuQGV4YW1wbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Kr+Dcds/JQ5GwejJFcBIP682X3xpjis56AK02bc1FLgzdLI8auoR+cC9/Vrh5t66HkQIOdA4unHh0AaZ4xL5PhVbXIPMB5vAPKpzz5iPSi8xO8SL7I7SDhcBVJhqVqr3HgllEG6UClDdHO7nkLuwXq8HcISKkbT5WFTVfFZzidPl8HZ7DhXkZIRtJwBweq4bvm3hM1Os7UQH05ZS6cVDgweKNwdLLrT51ikSQG3DYrl+ft781UQRIqxgwqCfXEuDiinPh0kkvIi5jivVu1Z9QiwlYEdRbLJ4zJQBmDrSGTMYn4lRc2HgHO4DqB/bnMVorHB0CC6AV1QoFK4GPe1LwIDAQABo3sweTAJBgNVHRMEAjAAMCwGCWCGSAGG+EIBDQQfFh1PcGVuU1NMIEdlbmVyYXRlZCBDZXJ0aWZpY2F0ZTAdBgNVHQ4EFgQU8pD0U0vsZIsaA16lL8En8bx0F/gwHwYDVR0jBBgwFoAUdGeKitcaF7gnzsNwDx708kqaVt0wDQYJKoZIhvcNAQEFBQADgYEAA81SsFnOdYJtNg5Tcq+/ByEDrBgnusx0jloUhByPMEVkoMZ3J7j1ZgI8rAbOkNngX8+pKfTiDz1RC4+dx8oU6Za+4NJXUjlL5CvV6BEYb1+QAEJwitTVvxB/A67g42/vzgAtoRUeDov1+GFiBZ+GNF/cAYKcMtGcrs2i97ZkJMo='
    }
    ],
    'meta': {
      'created': '2010-01-23T04:56:22Z',
      'lastModified': '2011-05-13T04:42:34Z',
      'version': 'aversion',
      'location': 'http://localhost:8080/identity/seam/resource/restv1/Users/0x0x0x00-xxxx-0000-xxxx-x0000x0xx0x0'
    }
  };

scim.addUser(userSampleData, callback);
// endregion

// region "removeUser": To delete user from SCIM using id attribute of type inum.
// "id" is inum of user.
scim.removeUser(id, callback);
// endregion
