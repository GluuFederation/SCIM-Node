'use strict';

var fs = require('fs');
var { v4: uuidv4 } = require('uuid');
var axios = require('axios');
var jwt = require('jsonwebtoken');
var Promise = require('bluebird');
var parsers = require('www-authenticate').parsers;


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
      url: domain.concat('/.well-known/uma2-configuration')
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var umaConfigurations = response.data;
          return resolve(umaConfigurations);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
        });
    });
  }

  /**
   * Gets configurations of SCIM 2.0 from domain URL.
   * @param {string} domain - Gluu server domain Url
   * @returns {Promise.<scimConfigurations, error>} - A promise that returns a scimConfigurations if resolved, or an
   * Error if rejected.
   * 
   * scimConfigurations 
   * {
   *   auth: [ 'oauth2', 'uma' ],
   *   user_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/Users',
   *   group_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/Groups',
   *   fido_devices_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/FidoDevices',
   *   fido2_devices_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/Fido2Devices',
   *   version: '2.0',
   *   service_provider_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/ServiceProviderConfig',
   *   resource_types_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/ResourceTypes',
   *   schemas_endpoint: 'https://<your.op.server.com>/identity/restv1/scim/v2/Schemas'
   * }
   */
  function getSCIMConfigurations(domain) {
    var serviceProviderConfigRequestOption = {
      method: 'GET',
      url: domain.concat('/identity/restv1/scim/v2/ServiceProviderConfig')
    };
    const scimConfiguration = {}

    return axios(serviceProviderConfigRequestOption)
      .then(function (response) {
        try {
          const serviceProviderConfigJSON = response.data;
          const { authenticationSchemes } = serviceProviderConfigJSON;
          if (!authenticationSchemes || !authenticationSchemes.length) {
            return Promise.reject("authentication schemes not found")
          }
          scimConfiguration.auth = authenticationSchemes.map((authScheme) => authScheme.type);
        } catch (ex) {
          return Promise.reject(ex);
        }

        var resourceTypesRequestOption = {
          method: 'GET',
          url: domain.concat('/identity/restv1/scim/v2/ResourceTypes')
        };

        return axios(resourceTypesRequestOption)
      })
      .then((response) => {
        try {
          const resourceTypesConfigJSON = response.data;
          const { Resources } = resourceTypesConfigJSON;

          if (!Resources || !Resources.length) {
            return Promise.reject("Resources not found")
          }

          scimConfiguration.user_endpoint = domain.concat(`/identity/restv1${getResourceEndpoint(Resources, "User")}`)
          scimConfiguration.group_endpoint = domain.concat(`/identity/restv1${getResourceEndpoint(Resources, "Group")}`)
          scimConfiguration.fido_devices_endpoint = domain.concat(`/identity/restv1${getResourceEndpoint(Resources, "FidoDevice")}`)
          scimConfiguration.fido2_devices_endpoint = domain.concat(`/identity/restv1${getResourceEndpoint(Resources, "Fido2Device")}`)

          scimConfiguration.version = "2.0"
          scimConfiguration.service_provider_endpoint = domain.concat("/identity/restv1/scim/v2/ServiceProviderConfig")
          scimConfiguration.resource_types_endpoint = domain.concat("/identity/restv1/scim/v2/ResourceTypes")
          scimConfiguration.schemas_endpoint = domain.concat("/identity/restv1/scim/v2/Schemas")

          return Promise.resolve(scimConfiguration)
        }
        catch (ex) {
          return Promise.reject(ex);
        }
      })
      .catch(function (error) {
        return Promise.reject(handleAxiosError(error));
      });

      function getResourceEndpoint(resourcesData, resourceId) {
        return resourcesData.find((r) => r.id == resourceId).endpoint
      }
  }

  function getTicketAndConfig(resourceURL) {
    var options = {
      method: 'GET',
      url: resourceURL
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          reject(resourceURL);
        })
        .catch(function (error) {
          if (error.response && error.response.status == 401) {
            var parsed = new parsers.WWW_Authenticate(error.response.headers['www-authenticate']);
            resolve({ ticket: parsed.parms.ticket, as_URI: parsed.parms.as_uri });
          }
          else {
            reject(handleAxiosError(error));
          }
        });
    });
  }
  /**
   * Gets AAT token detail.
   * @param {json} config - json of config values of Gluu client
   * @param {string} tokenEndpoint - Token endpoint URL retrieve from UMA configuration.
   * @returns {Promise<AATDetails, error>} - A promise that returns a AATDetails if resolved, or an Error if rejected.
   */
  function getToken(config, tokenEndpoint, ticket) {
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
      data: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        scope: 'uma_authorization',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: token,
        client_id: config.clientId,
        ticket: ticket.ticket
      }).toString()
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var AATDetails = response.data;
          if (AATDetails.error) {
            return reject(AATDetails.error);
          }

          return resolve(AATDetails);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
        });
    });
  }

  /**
   * Gets RPT and SCIM details of Gluu client
   * @param {string} config - json of config values of Gluu client
   * @returns {Promise<rptDetail, error>} - A promise that returns a rptDetail if resolved, or an Error if rejected.
   */
  function getRPTToken(config, resourceURL) {
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
          return getTicketAndConfig(resourceURL);
        })
        .then(function (ticket) {
          rptDetail.ticket = ticket;
          return getToken(config, rptDetail.umaConfiguration.token_endpoint, rptDetail.ticket);
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
        data: { ticket: ticket, rpt: rpt }
      };

      return axios(options)
        .then(function (response) {
          var rptDetails = response.data;
          return resolve(rptDetails.rpt);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
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
  function get(endpoint, rpt, startIndex, count, filter) {
    var options = {
      method: 'GET',
      url: endpoint,
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      params: {}
    };

    if (filter) {
      options.params.filter = filter;
    }

    if (count > 0 && startIndex > 0) {
      options.params.startIndex = startIndex;
      options.params.count = count;
    }

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var usersDetail = response.data;
          return resolve(usersDetail);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
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
  function getById(endpoint, rpt, id, filter) {
    var options = {
      method: 'GET',
      url: endpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      params: {}
    };

    if (filter) {
      options.params.filter = filter;
    }

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var userDetail = response.data;
          return resolve(userDetail);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
        });
    });
  }

  /**
   * Insert new user.
   * @param {string} endpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {object} data - User details to be inserted
   * @returns {Promise<detail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  function insert(endpoint, rpt, data, schema) {
    data.schemas = [schema]; //'urn:ietf:params:scim:schemas:core:2.0:User'

    var options = {
      method: 'POST',
      url: endpoint,
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      data: data
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var detail = response.data;
          return resolve(detail);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
        });
    });
  }

  /**
     * Update user or group.
     * @param {string} endpoint - User or Group Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - User or Group Inum
     * @param {object} data - User or Group details to be updated
     * @returns {Promise<detail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
  function update(endpoint, rpt, data, schema, id) {
    data.schemas = [schema];

    var options = {
      method: 'PUT',
      url: endpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      data: data
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var detail = response.data;
          return resolve(detail);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
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
  function _delete(endpoint, rpt, id) {
    var options = {
      method: 'DELETE',
      url: endpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      }
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var userDetail = response.data;
          return resolve(userDetail);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
        });
    });
  }

  /**
   * Search users.
   * @param {string} endpoint - User or Group Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {string} filter - Search filters
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @param {string} schema - uma user search schema
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns users if resolved, or an Error if rejected.
   */
  function search(endpoint, rpt, filter, startIndex, count, schema) {
    var data = {
      schemas: [schema],
      filter: filter,
      startIndex: startIndex,
      count: count
    };

    var options = {
      method: 'POST',
      url: endpoint.concat('/').concat('.search'),
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      data: data
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          var detail = response.data;
          return resolve(detail);
        })
        .catch(function (error) {
          return reject(handleAxiosError(error));
        });
    });
  }

  /**
   * Return a new nively wrapped error if given error is an error generated by axios, else return given error.
   * @param {Error} error 
   */
  function handleAxiosError(error) {
    if (error.isAxiosError) {
      var message = "";
      var code = 500;
      if (error.response) {
        // The request was made and the server responded with a status code that falls out of the range of 2xx
        code = error.response.status;
        message = error.response.statusText;
        if (error.response.data) {
          if (error.response.data.message) {
            message = `${message} - ${error.response.data.message}`;
          }
          if (error.response.data.detail) {
            message = `${message} - ${error.response.data.detail}`;
          }
        }
      } 
      else if (error.request) {
          // The request was made but no response was received, `error.request` is an instance of http.ClientRequest
          message = `Server did not answer request on ${error.request.path}`;
      }
      else {
          // Something happened in setting up the request and triggered an Error
          message = error.message;
      }
      const err = new Error(message);
      err.statusCode = code;
      return err;
    }
    else {
      return error;
    }
  }

  /**
   * To return users count.
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns users count if resolved,
   * or an Error if rejected.
   */
  module.getUsersCount = function getUsersCount(callback) {
    return new Promise(function (resolve, reject) {
      var userEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          console.log(scimConfig)
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          return get(userEndpoint, rptDetail.RPT.access_token, 0, 0, undefined)
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
  module.getUsers = function getUsers(startIndex, count, filter, callback) {
    return new Promise(function (resolve, reject) {
      if (count < 0 || startIndex < 0) {
        return reject(new Error('Provide valid value of count and startIndex. Values must be greater then 0.'));
      }

      var userEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          return get(userEndpoint, rptDetail.RPT.access_token, startIndex, count, filter);
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
  module.getUser = function getUser(id, filter, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }
      var userEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          return getById(userEndpoint, rptDetail.RPT.access_token, id, filter)
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          return insert(userEndpoint, rptDetail.RPT.access_token, userData, 'urn:ietf:params:scim:schemas:core:2.0:User')
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          return _delete(userEndpoint, rptDetail.RPT.access_token, id)
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To edit user.
   * @param {string} id - inum of user
   * @param {object} userData - Object of user details
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  module.editUser = function editUser(id, userData, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }
      var userEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          let schema = 'urn:ietf:params:scim:schemas:core:2.0:User';
          if (userData['schema']) {
            schema = userData['schema'];
            delete userData['schema'];
          }
          return update(userEndpoint, rptDetail.RPT.access_token, userData, schema, id)
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To return group count.
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns groups count if resolved,
   * or an Error if rejected.
   */
  module.getGroupCount = function getGroupCount(callback) {
    return new Promise(function (resolve, reject) {
      var groupEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          groupEndpoint = scimConfig.group_endpoint;
          return getRPTToken(params, groupEndpoint);
        })
        .then(function (rptDetail) {
          return get(groupEndpoint, rptDetail.RPT.access_token, 0, 0, undefined)
        })
        .then(function (groups) {
          return resolve(groups);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
  module.getGroups = function getGroups(startIndex, count, filter, callback) {
    return new Promise(function (resolve, reject) {
      if (count < 0 || startIndex < 0) {
        return reject(new Error('Provide valid value of count and startIndex. Values must be greater then 0.'));
      }

      var groupEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          groupEndpoint = scimConfig.group_endpoint;
          return getRPTToken(params, groupEndpoint);
        })
        .then(function (rptDetail) {
          return get(groupEndpoint, rptDetail.RPT.access_token, startIndex, count, filter)
        })
        .then(function (groups) {
          return resolve(groups);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
  module.getGroup = function getGroup(id, filter, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }
      var groupEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          groupEndpoint = scimConfig.group_endpoint;
          return getRPTToken(params, groupEndpoint);
        })
        .then(function (rptDetail) {
          return getById(groupEndpoint, rptDetail.RPT.access_token, id, filter)
        })
        .then(function (groups) {
          return resolve(groups);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
  module.addGroup = function addGroup(groupData, callback) {
    return new Promise(function (resolve, reject) {
      var groupEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          groupEndpoint = scimConfig.group_endpoint;
          return getRPTToken(params, groupEndpoint);
        })
        .then(function (rptDetail) {
          return insert(groupEndpoint, rptDetail.RPT.access_token, groupData, 'urn:ietf:params:scim:schemas:core:2.0:Group')
        })
        .then(function (groups) {
          return resolve(groups);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To add new user.
   * @param {string} id - inum of the group
   * @param {object} userData - Object of user details
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  module.editGroup = function editGroup(id, groupData, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }
      var groupEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          groupEndpoint = scimConfig.group_endpoint;
          return getRPTToken(params, groupEndpoint);
        })
        .then(function (rptDetail) {
          return update(groupEndpoint, rptDetail.RPT.access_token, groupData, 'urn:ietf:params:scim:schemas:core:2.0:Group', id)
        })
        .then(function (groups) {
          return resolve(groups);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
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
  module.removeGroup = function removeGroup(id, callback) {
    return new Promise(function (resolve, reject) {
      if (!id) {
        return reject(new Error('Provide valid value of id.'));
      }
      var groupEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          groupEndpoint = scimConfig.group_endpoint;
          return getRPTToken(params, groupEndpoint);
        })
        .then(function (rptDetail) {
          return _delete(groupEndpoint, rptDetail.RPT.access_token, id)
        })
        .then(function (groups) {
          return resolve(groups);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
          return reject(error);
        });
    }).asCallback(callback);
  };

  /**
   * To send search request.
   * @param {string} filter - Filter string
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @param {requestCallback} [callback] - The callback that handles the response and Error.
   * @returns {requestCallback|Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  module.searchUsers = function searchUsers(filter, startIndex, count, callback) {
    return new Promise(function (resolve, reject) {
      var userEndpoint = '';
      return getSCIMConfigurations(params.domain)
        .then(function (scimConfig) {
          userEndpoint = scimConfig.user_endpoint;
          return getRPTToken(params, userEndpoint);
        })
        .then(function (rptDetail) {
          return search(userEndpoint, rptDetail.RPT.access_token, filter, startIndex, count, 'urn:ietf:params:scim:api:messages:2.0:SearchRequest')
        })
        .then(function (users) {
          return resolve(users);
        })
        .catch(function (error) {
          if (error.response && error.response.status === 403) {
            // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.response.data, rptDetail.umaConfiguration.authorization_endpoint);
          }
          return reject(error);
        });
    }).asCallback(callback);
  };

  return module;
};
