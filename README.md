# SCIM-node

SCIM is a specification designed to reduce the complexity of user management operations by providing a common user schema and the patterns for exchanging this schema using HTTP in a platform-neutral fashion. The aim of SCIM is to achieve interoperability, security, and scalability in the context of identity management.

Developers can think of SCIM merely as a REST API with endpoints exposing CRUD functionality (create, update, retrieve and delete).

Detailed specifications for SCIM can be found at [RFC 7642](https://tools.ietf.org/html/rfc7642), [RFC 7643](https://tools.ietf.org/html/rfc7643), and [RFC 7644](https://tools.ietf.org/html/rfc7644).

SCIM node is a client library for the Gluu SCIM 2.0. Gluu's implementation of SCIM service is available at [User Management with SCIM](https://www.gluu.org/docs/ce/user-management/scim2/).

There are two SCIM for dealing with UMA 1.0 and UMA 2.0.

For UMA 1.0 use

```
var scim = require('scim-node')(config);
scim.scim.getUsersCount(callback);
```

For UMA 2.0 use

```
var scim = require('scim-node')(config);
scim.scim2.getUsersCount(callback);
```

## Prerequisite

1. Gluu CE >= 4.0
1. Node JS >= 10.x.x

## Installation

```sh
$ npm install scim-node
```

## Configuration

1. Copy the requesting party JKS file to your nodejs project (inside the Gluu server chroot, it is located at `/install/community-edition-setup/output/scim-rp.jks`).

2. Have the requesting party client ID and password at hand. You can find this info in the file `/install/community-edition-setup/setup.properties.last`. Try running `cat setup.properties.last | grep "scim_rp_client"`. The default password is `secret`.

3. [Ensure you have enabled SCIM and UMA](https://www.gluu.org/docs/ce/user-management/scim2/#protection-using-uma).

4. scim-node need privateKey, keyAlg and keyId. so you need to run [generate-private-key.sh](https://raw.githubusercontent.com/GluuFederation/SCIM-Node/master/generate-private-key.sh). Download [generate-private-key.sh](https://raw.githubusercontent.com/GluuFederation/SCIM-Node/master/generate-private-key.sh) file, put it in your project root folder where you have `scim-rp.jks` file. it will provide you private key file `final-private-key.key`, `keyId` and `keyAlg`. you just need to pass the scim_rp_client's password.

     ```
     sh generate-privte-key.sh [scim_rp_client's password]
     ```

     Once you run this file. It will show keyId and keyAlg. You need to copy and use it for scim-node configuration.

5. Use above all values to configure scim-node.

```javascript
var config = {
  keyAlg: 'XXXXX', // Algorithm type.
  domain: 'https://example.com/', // Gluu server URL.
  privateKey: 'final-private-key.key', // Value can be buffer or path of private key.
  clientId: '@!XXXX.XXXX.XXXX.XXXX!XXXX!XXXX.XXXX!XXXX!XXXX.XXXX', // scim_rp_client's client id.
  keyId: '000xx0x0-xx00-00xx-xx00-0x000x0x000x', // JWKS key id.
};

var scim = require('scim-node')(config);
```

## Methods

| Method  | Description |
|---------|-------------|
|`scim.scim2.getUsersCount(callback)`| Get total number of users.|
|`scim.scim2.getUsers(startIndex, count, filter, callback)`| Get users records. |
|`scim.scim2.searchUsers(filter, startIndex, count, callback)`| Extra search to get users records|
|`scim.scim2.getUser(id, filter, callback)`| Get the user by id. |
|`scim.scim2.addUser(userData, callback)`| Add the user. |
|`scim.scim2.removeUser(id, callback)`| Delete the user. |
|`scim.scim2.editUser(id, userData, callback)`| Update the details of user. |
|`scim.scim2.getGroupCount(callback)`| Get total number of groups. |
|`scim.scim2.getGroups(startIndex, count, filter, callback)`| Get groups records. |
|`scim.scim2.getGroup(id, filter, callback)`| Get the groups by id. |
|`scim.scim2.addGroup(groupData, callback)`| Add the group. |
|`scim.scim2.editGroup(id, groupData, callback)`| Update the details of group. |
|`scim.scim2.removeGroup(id, callback)`| Delete the group. |

### Example

**Request:**

```javascript
// Process data or handle error in callback function.
scim.scim2.getUsersCount(callback);
function callback(error, data) {
  if (error) {
    // Handle error here.
  } else {
    // Process data here.
  }
}
```
or
  ```javascript
// Process data or handle error using promise.
scim.scim2.getUsersCount().then(function (data) {
  // Process data here.
}).catch(function (error) {
  // Handle error here.
});
```

**Response:**

| Status Code | Reason               | Response Model |
|-------------|----------------------|----------------|
| 200         | successful operation | ListResponse   |
| error_code  | failed operation     | Error          |

# License

(MIT License)

Copyright (c) 2016-2019 Gluu
