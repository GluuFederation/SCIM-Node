# SCIM-node

SCIM node is a client library for the Gluu SCIM 2.0. For information about SCIM 2.0, visit <https://gluu.org/docs/api/scim-2.0/>
There are two scim for dealing with UMA 1.0 and UMA 2.0.
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
## Installation

* [Github sources](https://github.com/GluuFederation/scim-node)
* [Gluu Server](https://www.gluu.org/docs/deployment/ubuntu/)

Install scim-node using following command:
```sh
$ npm install scim-node
```

**Prerequisite**

```
1) Install gluu server in your hosting server to use scim-node library.
2) Enable SCIM support in gluu server.
3) Application will not work if your host is not secure with https.

```

**Note:** To enable SCIM support, log into oxTrust, open organization configuration page, set "SCIM Support" to "Enabled" and save configuration. The [scim-node](https://github.com/GluuFederation/scim-node) contains complete documentation about itself.

## Usage
example.js file contains sample code to call each function. Each function has two way to process data and handle error, either using callback function or using promise.

**Initialization**
```javascript
var config = {
  keyAlg: 'XXXXX', // Algorithm type.
  domain: 'https://example.com/', // Gluu server URL.
  privateKey: 'value', // Value can be buffer or path of private key.
  clientId: '@!XXXX.XXXX.XXXX.XXXX!XXXX!XXXX.XXXX!XXXX!XXXX.XXXX', // UMA client id.
  keyId: '000xx0x0-xx00-00xx-xx00-0x000x0x000x', // oxAuth JWKS key id.
};

var scim = require('scim-node')(config);
```

**Methods:**
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
