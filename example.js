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

### 1) getUsersCount
To get total count of users.

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

### 2) getUsers
To get collection of users.
"startIndex" is page index.
"count" is number of users to be returned.

**Request:**

```javascript
scim.scim2.getUsers(startIndex, count, callback);
```

**Response:**

| Status Code | Reason               | Response Model |
|-------------|----------------------|----------------|
| 200         | successful operation | ListResponse   |
| error_code  | failed operation     | Error          |

### 3) getUser
To get user object using id attribute of type inum.
"id" is inum of user.

**Request:**

```javascript
scim.scim2.getUser(id, callback);
```

**Response:**

| Status Code | Reason               | Response Model |
|-------------|----------------------|----------------|
| 200         | successful operation | User           |
| error_code  | failed operation     | Error          |

### 4) addUser
To insert new user to SCIM.
'userSampleData' can be object or json ('username' attribute is required. 'meta' attribute is readonly).
Full structure of 'userSampleData' is specified in example.js file.

**Request:**

```javascript
scim.scim2.addUser(userSampleData, callback);
```

**Response:**

| Status Code | Reason               | Response Model |
|-------------|----------------------|----------------|
| 201         | successful operation | User           |
| error_code  | failed operation     | Error          |

### 5) removeUser
To delete user from SCIM using id attribute of type inum.
"id" is inum of user.

**Request:**

```javascript
scim.scim2.removeUser(id, callback);
```

**Response:**

| Status Code | Reason               | Response Model |
|-------------|----------------------|----------------|
| default     | successful operation | -              |
| error_code  | failed operation     | Error          |

# License

(MIT License)

Copyright (c) 2016 Gluu
