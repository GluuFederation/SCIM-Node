'use strict';

var fs = require('fs');
var { v4: uuidv4 } = require('uuid');
var request = require('request-promise');
var jwt = require('jsonwebtoken');
var Promise = require('bluebird');

module.exports = function (params) {
  var module = {};

  /**
   * Gets configurations of UMA from domain URL
   * @param {string} domain - Gluu server domain Url
   * @returns {Promise.<umaConfigurations, error>} - A promise that returns a umaConfigurations if resolved, or an
   * Error if rejected.
   */
  function getUmaConfigurations(domain) {
    var options = {
      method: 'GET',
      url: domain.concat('.well-known/uma-configuration')
    };    
    
    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (umaConfigurations) {
          try {
            umaConfigurations = JSON.parse(umaConfigurations);
          } catch (ex) {
            return reject(umaConfigurations);
          }

          return resolve(umaConfigurations);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Gets configurations of SCIM 2.0 from domain URL.
   * @param {string} domain - Gluu server domain Url
   * @returns {Promise.<scimConfigurations, error>} - A promise that returns a scimConfigurations if resolved, or an
   * Error if rejected.
   */
  function getSCIMConfigurations(domain) {
    var options = {
      method: 'GET',
      url: domain.concat('.well-known/scim-configuration')
    };

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (scimConfigurations) {
          try {
            scimConfigurations = JSON.parse(scimConfigurations);
          } catch (ex) {
            return reject(scimConfigurations);
          }

          return resolve(scimConfigurations[1]);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Gets AAT token detail.
   * @param {json} config - json of config values of Gluu client
   * @param {string} tokenEndpoint - Token endpoint URL retrieve from UMA configuration.
   * @returns {Promise<AATDetails, error>} - A promise that returns a AATDetails if resolved, or an Error if rejected.
   */
  function getAAT(config, tokenEndpoint) {
    var scimCert = fs.readFileSync(config.privateKey, 'utf8'); // get private key and replace headers to sign jwt
    scimCert = scimCert.replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----');
    scimCert = scimCert.replace('-----END RSA PRIVATE KEY-----', '-----END PRIVATE KEY-----');

    var optionsToken = {
      algorithm: config.keyAlg,
      header: {
        'typ': 'JWT',
        'alg': config.keyAlg,
        'kid': config.keyId
      }
    };
    var token = jwt.sign({
      iss: config.clientId,
      sub: config.clientId,
      aud: tokenEndpoint,
      jti: uuidv4(),
      exp: (new Date().getTime() / 1000 + 30),
      iat: (new Date().getTime())
    }, scimCert, optionsToken);

    var options = {
      method: 'POST',
      url: tokenEndpoint,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'client_credentials',
        scope: 'uma_authorization',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: token,
        client_id: config.clientId
      }
    };

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (AATDetails) {
          try {
            AATDetails = JSON.parse(AATDetails);
          } catch (ex) {
            return reject(AATDetails);
          }

          if (AATDetails.error) {
            return reject(AATDetails.error);
          }

          return resolve(AATDetails);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Gets RPT token detail.
   * @param {string} accessToken - Access token value retrieve from getAAT
   * @param {string} rptEndpoint - RPT endpoint URL retrieve from UMA configuration.
   * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
   */
  function getRPT(accessToken, rptEndpoint) {
    var options = {
      method: 'POST',
      url: rptEndpoint,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer '.concat(accessToken)
      }
      // ,body: JSON.stringify({scopes: [scopeEndpoint.concat('/scim_access')]})
    };

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (rptDetails) {
          try {
            rptDetails = JSON.parse(rptDetails);
          } catch (ex) {
            return reject(rptDetails);
          }

          return resolve(rptDetails.rpt);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Gets RPT and SCIM details of Gluu client
   * @param {string} config - json of config values of Gluu client
   * @returns {Promise<rptDetail, error>} - A promise that returns a rptDetail if resolved, or an Error if rejected.
   */
  function getRPTToken(config) {
    return new Promise(function (resolve, reject) {
      if (!config.domain) {
        return reject('Provide valid value of domain, passed as json element "domain" of module');
      }
      if (!config.privateKey) {
        return reject('Provide valid value of privateKey, passed as json element "privateKey" of module');
      }
      if (!config.clientId) {
        return reject('Provide valid value of clientId, passed as json element "clientId" of module');
      }
      if (!config.keyAlg) {
        return reject('Provide valid value of keyAlg, passed as json element "keyAlg" of module');
      }
      if (!config.keyId) {
        return reject('Provide valid value of keyId, passed as json element "keyId" of module');
      }

      var rptDetail = {};
      return getUmaConfigurations(config.domain)
        .then(function (umaConfigurations) {
          rptDetail.umaConfiguration = umaConfigurations;
          return getSCIMConfigurations(config.domain);
        })
        .then(function (scimConfig) {
          rptDetail.scimConfig = scimConfig;
          return getAAT(config, rptDetail.umaConfiguration.token_endpoint);
        })
        .then(function (AATDetails) {
          rptDetail.AAT = AATDetails.access_token;
          return getRPT(rptDetail.AAT, rptDetail.umaConfiguration.rpt_endpoint);
        })
        .then(function (rpt) {
          rptDetail.RPT = rpt;
          return resolve(rptDetail);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Authorizes RPT token by requesting PAT using ticket number.
   * @param {GUID} aat - Access token
   * @param {json} scimResponse - json response of SCIM method call that contains ticket number.
   * @param {string} authorizationEndpoint - Authorization Endpoint URL retrieved from uma configuration
   * @returns {Promise<rptDetail, error>} - A promise that returns a rptDetail if resolved, or an Error if rejected.
   */
  function authorizeRPT(rpt, aat, scimResponse, authorizationEndpoint) {
    return new Promise(function (resolve, reject) {
      if (typeof scimResponse !== 'object') {
        try {
          scimResponse = JSON.parse(scimResponse);
        } catch (ex) {
          return reject(scimResponse);
        }
      }

      var ticket = scimResponse.ticket;
      if (!ticket) {
        return reject('Ticket not found, RPT can not authorize.');
      }

      var options = {
        method: 'POST',
        url: authorizationEndpoint,
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer '.concat(aat)
        },
        body: JSON.stringify({ticket: ticket, rpt: rpt})
      };

      return request(options)
        .then(function (rptDetails) {
          try {
            rptDetails = JSON.parse(rptDetails);
          } catch (ex) {
            return reject(rptDetails.toString());
          }

          return resolve(rptDetails.rpt);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Retrieves user list or total counts if count is zero or undefined.
   * @param {string} userEndpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @returns {Promise<usersDetail, error>} - A promise that returns a usersDetail if resolved, or an Error if
   * rejected.
   */
  function retrieveUsers(userEndpoint, rpt, startIndex, count) {
    var options = {
      method: 'GET',
      url: userEndpoint,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer '.concat(rpt)
      }
    };

    if (count > 0 && startIndex > 0) {
      options.qs = {startIndex: startIndex, count: count};
    }

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (usersDetail) {
          return resolve(usersDetail);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Retrieves specific user.
   * @param {string} userEndpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {string} id - Inum of user to be retrieve
   * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  function retrieveUser(userEndpoint, rpt, id) {
    var options = {
      method: 'GET',
      url: userEndpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer '.concat(rpt)
      }
    };

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (userDetail) {
          return resolve(userDetail);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Insert new user.
   * @param {string} userEndpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {object} userData - User details to be inserted
   * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  function insertUser(userEndpoint, rpt, userData) {
    userData.schemas = ['urn:ietf:params:scim:schemas:core:2.0:User'];

    var options = {
      method: 'POST',
      url: userEndpoint,
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      body: JSON.stringify(userData)
    };

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (userDetail) {
          return resolve(userDetail);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Delete specific user.
   * @param {string} userEndpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {string} id - Inum of user to be retrieve
   * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  function deleteUser(userEndpoint, rpt, id) {
    var options = {
      method: 'DELETE',
      url: userEndpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer '.concat(rpt)
      }
    };

    return new Promise(function (resolve, reject) {
      request(options)
        .then(function (userDetail) {
          return resolve(userDetail);
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  }

  /**
   * Callback function for all the export functions.
   * @callback requestCallback
   * @param {Error} error - Error information from base function.
   * @param {Object} data - Data from base function.
   */

  /**
   * To return users count.
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns users count if resolved,
   * or an Error if rejected.
   */
  module.getUsersCount = function getUsersCount(callback) {
    return new Promise(function (resolve, reject) {
      var userEndpoint = '';
      getRPTToken(params)
        .then(function (rptDetail) {
          userEndpoint = rptDetail.scimConfig.user_endpoint;
          return retrieveUsers(userEndpoint, rptDetail.RPT, 0, 0)
            .then(function (usersCount) {
              return resolve(usersCount);
            })
            .catch(function (error) {
              if (error.statusCode === 403) {
                return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
              }

              return reject(error);
            });
        })
        .then(function (rpt) {
          return retrieveUsers(userEndpoint, rpt, 0, 0);
        })
        .then(function (usersCount) {
          return resolve(usersCount);
        })
        .catch(function (error) {
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To return user list.
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns users if resolved, or an Error if rejected.
   */
  module.getUsers = function getUsers(startIndex, count, callback) {
    return new Promise(function (resolve, reject) {
      if (!count || count <= 0 || !startIndex || startIndex <= 0) {
        return reject(new Error('Provide valid value of count and startIndex. Values must be greater then 0.'));
      }

      var userEndpoint = '';
      return getRPTToken(params)
        .then(function (rptDetail) {
          userEndpoint = rptDetail.scimConfig.user_endpoint;
          return retrieveUsers(userEndpoint, rptDetail.RPT, startIndex, count)
            .then(function (users) {
              return resolve(users);
            })
            .catch(function (error) {
              if (error.statusCode === 403) {
                return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
              }

              return reject(error);
            });
        })
        .then(function (rpt) {
          return retrieveUsers(userEndpoint, rpt, startIndex, count);
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * Returns specific user detail.
   * @param {string} id - inum of user
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  module.getUser = function getUser(id, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }

      var userEndpoint = '';
      return getRPTToken(params)
        .then(function (rptDetail) {
          userEndpoint = rptDetail.scimConfig.user_endpoint;
          return retrieveUser(userEndpoint, rptDetail.RPT, id)
            .then(function (user) {
              return resolve(user);
            })
            .catch(function (error) {
              if (error.statusCode === 403) {
                return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
              }

              return reject(error);
            });
        })
        .then(function (rpt) {
          return retrieveUser(userEndpoint, rpt, id);
        })
        .then(function (user) {
          return resolve(user);
        })
        .catch(function (error) {
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To add new user.
   * @param {object} userData - Object of user details
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  module.addUser = function addUser(userData, callback) {
    return new Promise(function (resolve, reject) {
      var userEndpoint = '';
      return getRPTToken(params)
        .then(function (rptDetail) {
          userEndpoint = rptDetail.scimConfig.user_endpoint;
          return insertUser(userEndpoint, rptDetail.RPT, userData)
            .then(function (user) {
              return resolve(user);
            })
            .catch(function (error) {
              if (error.statusCode === 403) {
                return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
              }

              return reject(error);
            });
        })
        .then(function (rpt) {
          return insertUser(userEndpoint, rpt, userData);
        })
        .then(function (user) {
          return resolve(user);
        })
        .catch(function (error) {
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To remove user.
   * @param {string} id - inum of user
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
   */
  module.removeUser = function removeUser(id, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }

      var userEndpoint = '';
      return getRPTToken(params)
        .then(function (rptDetail) {
          userEndpoint = rptDetail.scimConfig.user_endpoint;
          return deleteUser(userEndpoint, rptDetail.RPT, id)
            .then(function (user) {
              return resolve(user);
            })
            .catch(function (error) {
              if (error.statusCode === 403) {
                return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
              }

              return reject(error);
            });
        })
        .then(function (rpt) {
          return deleteUser(userEndpoint, rpt, id);
        })
        .then(function (user) {
          return resolve(user);
        })
        .catch(function (error) {
          return reject(error);
        });
    }).asCallback(callback);
  };

  return module;
};
