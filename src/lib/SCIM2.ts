import ScimCommon, {AATDetails, GluuResponse,groupDetail, rptDetails,ScimConfig,scimConfigurations, scimResponse,ticket,umaConfigurations, userDetail} from "./SCIMCommon";
import axios, {AxiosResponse} from "axios";
import {parsers} from "www-authenticate";
import fs from "fs";
import jwt from "jsonwebtoken";
import uuid from "uuid";
import queryString from "querystring";

export default class SCIM2 extends ScimCommon {
  constructor(params: ScimConfig) {
    super(params);
  }

  /**
   * Gets configurations of UMA from domain URL
   * @param {string} domain - Gluu server domain Url
   * @returns {Promise.<umaConfigurations, error>} - A promise that returns a umaConfigurations if resolved, or an
   * Error if rejected.
   */
  private async getUmaConfigurations(domain): Promise<umaConfigurations> {
    let options = {
      method: 'GET',
      url: domain.concat('/.well-known/uma2-configuration')
    };

    let result = <AxiosResponse>await axios.request(options);

    return <umaConfigurations>result.data;
  }

  /**
   * Gets configurations of SCIM 2.0 from domain URL.
   * @param {string} domain - Gluu server domain Url
   * @returns {Promise<scimConfigurations>}
   */
  private async getSCIMConfigurations(domain: string): Promise<scimConfigurations> {
    let options = {
      method: 'GET',
      url: domain.concat('/.well-known/scim-configuration')
    };

    let configuration = (await axios.request(options)).data;

    return <scimConfigurations>configuration[0];
  }


  private async getTicketAndConfig(resourceURL: string): Promise<any> {
    let options = {
      method: 'GET',
      url: resourceURL
    };

    let result;
    try {
      result = await axios.request(options);
    }
    catch (error) {
      if (error.response.status == 401) {
        let parsed = new parsers.WWW_Authenticate(error.response.headers['www-authenticate']);
        return ({ticket: parsed.parms.ticket, as_URI: parsed.parms.as_uri});
      }
      else if (this.params.scimTestMode && error.response.status === 500 && error.response.data === "No authorization header found") {
        return ({ticket: "", as_URI: ""});
      }
      else {
        throw error;
      }
    }

    let data;
    try {
      data = JSON.parse(result.data);
    }
    catch (e) {
      throw result;
    }

    return <umaConfigurations>data;
  }


  /**
   * Gets AAT token detail.
   * @param {ScimConfig} config - json of config values of Gluu client
   * @param {string} tokenEndpoint - Token endpoint URL retrieve from UMA configuration.
   * @param ticket
   * @returns {Promise<AATDetails, error>} - A promise that returns a AATDetails if resolved, or an Error if rejected.
   */
  private async getToken(config: ScimConfig, tokenEndpoint: string, ticket: ticket): Promise<AATDetails> {
    let scimCert = fs.readFileSync(config.privateKey, 'utf8'); // get private key and replace headers to sign jwt
    scimCert = scimCert.replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----');
    scimCert = scimCert.replace('-----END RSA PRIVATE KEY-----', '-----END PRIVATE KEY-----');

    let optionsToken = {
      algorithm: config.keyAlg,
      header: {
        'typ': 'JWT',
        'alg': config.keyAlg,
        'kid': config.keyId
      }
    };

    let options = {
      method: 'POST',
      url: tokenEndpoint,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: null,
      auth: null
    };

    if (this.params.scimTestMode) {
      options.auth = {
        username: this.params.clientId,
        password: this.params.userPassword
      };
      options.data = queryString.stringify({
        grant_type: "client_credentials"
      })
    }
    else {
      let token = jwt.sign({
        iss: config.clientId,
        sub: config.clientId,
        aud: tokenEndpoint,
        jti: uuid(),
        exp: (new Date().getTime() / 1000 + 30),
        iat: (new Date().getTime())
      }, scimCert, optionsToken);

      options.data = queryString.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        scope: 'uma_authorization',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: token,
        client_id: config.clientId,
        ticket: ticket.ticket
      })
    }

    let result;
    try {
      result = <AxiosResponse>await axios.request(options);
    }
    catch (e) {
      debugger;
    }

    return <AATDetails>result.data;
  }


  /**
   *
   * Gets RPT and SCIM details of Gluu client
   * @param {ScimConfig} config - json of config values of Gluu client
   * @param resourceURL
   * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
   */
  private async getRPTToken(config: ScimConfig, resourceURL: string): Promise<rptDetails> {
    if (!config.domain)
      throw new Error('Provide valid value of domain, passed as json element "domain" of module');

    if (config.scimTestMode) {
      if (!config.userPassword)
        throw new Error('Provide valid value of userPassword, passed as json element "userPassword" of module to use scimTestMode')
    }
    else {
      if (!config.privateKey)
        throw new Error('Provide valid value of privateKey, passed as json element "privateKey" of module');

      if (!config.keyAlg)
        throw new Error('Provide valid value of keyAlg, passed as json element "keyAlg" of module');

      if (!config.keyId)
        throw new Error('Provide valid value of keyId, passed as json element "keyId" of module');
    }

    if (!config.clientId)
      throw new Error('Provide valid value of clientId, passed as json element "clientId" of module');

    let rptDetail: rptDetails = {};

    rptDetail.umaConfiguration = await this.getUmaConfigurations(config.domain);
    rptDetail.ticket = await this.getTicketAndConfig(resourceURL);
    rptDetail.RPT = await this.getToken(config, rptDetail.umaConfiguration.token_endpoint, rptDetail.ticket);

    return rptDetail;
  }

  /**
   * @todo never used ?
   * Authorizes RPT token by requesting PAT using ticket number.
   * @param rpt
   * @param {AATDetails} aat - Access token
   * @param {scimResponse} scimResponse - json response of SCIM method call that contains ticket number.
   * @param {string} authorizationEndpoint - Authorization Endpoint URL retrieved from uma configuration
   * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
   */
  private async authorizeRPT(rpt, aat, scimResponse: scimResponse, authorizationEndpoint): Promise<rptDetails> {

    if (typeof scimResponse !== 'object') {
      try {
        scimResponse = JSON.parse(scimResponse);
      } catch (ex) {
        throw scimResponse;
      }
    }

    let ticket = scimResponse.ticket;
    if (!ticket) {
      throw 'Ticket not found, RPT can not authorize.';
    }

    let options = {
      method: 'POST',
      url: authorizationEndpoint,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer '.concat(aat)
      },
      body: JSON.stringify({ticket: ticket, rpt: rpt})
    };

    let result = <AxiosResponse>await axios.request(options);

    return result.data;
  }


  /**
   * Retrieves user list or total counts if count is zero or undefined.
   * @param {string} endpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @returns {Promise<userDetail, error>} - A promise that returns a usersDetail if resolved, or an Error if
   * rejected.
   */
  private async get(endpoint: string, rpt: string, startIndex: number, count: number): Promise<GluuResponse<any>> {
    let options: {
      method: string
      url: string
      headers: object,
      params?: {
        startIndex: number,
        count: number
      }
    } = {
      method: 'GET',
      url: endpoint,
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
    };

    if (count > 0) {
      options.params = {startIndex: startIndex, count: count};
    }

    let result = <AxiosResponse>await axios.request(options);
    return result.data;
  }


  /**
   * Retrieves specific user.
   * @param {string} endpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {string} id - Inum of user to be retrieve
   * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  private async getById(endpoint: string, rpt: string, id: string): Promise<userDetail> {
    let options = {
      method: 'GET',
      url: endpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      }
    };

    let result = <AxiosResponse>await axios.request(options);

    return result.data;
  }

  /**
   * Insert new user.
   * @param {string} endpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {object} data - User details to be inserted
   * @param schema
   * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  private async insert(endpoint, rpt, data, schema): Promise<userDetail> {
    data.schemas = [schema]; //'urn:ietf:params:scim:schemas:core:2.0:User'

    let options = {
      method: 'POST',
      url: endpoint,
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      },
      body: JSON.stringify(data)
    };

    let result = <AxiosResponse>await axios.request(options);
    return result.data;
  }

  /**
   * Delete specific user.
   * @param {string} endpoint - User Endpoint URL of SCIM 2.0
   * @param {string} rpt - RPT token received from getRPT
   * @param {string} id - Inum of user to be retrieve
   * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
   */
  private async _delete(endpoint, rpt, id): Promise<userDetail> {
    let options = {
      method: 'DELETE',
      url: endpoint.concat('/').concat(id),
      headers: {
        'content-type': 'application/json',
        'Accept': 'application/scim+json;charset=utf-8',
        authorization: 'Bearer '.concat(rpt)
      }
    };


    let result = <AxiosResponse>await axios.request(options);

    // TODO check if return is userDetail
    return result.data;
  }


  /**
   * To return users count.
   * @returns {Promise<number>}
   */
  async getUsersCount(): Promise<number> {
    return (await this.getUsers(0, 0)).Resources.length;
  };


  /**
   * To return user list.
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @returns {Promise<Array<userDetail>, error>} - callback or promise that returns users if resolved, or an Error if rejected.
   */
  async getUsers(startIndex: number, count: number): Promise<GluuResponse<userDetail>> {
    try {
      let scimConfig = await this.getSCIMConfigurations(this.params.domain);
      let rptDetail = await this.getRPTToken(this.params, scimConfig.user_endpoint);
      return await this.get(scimConfig.user_endpoint, rptDetail.RPT.access_token, startIndex, count);
    }
    catch (error) {
      if (error.statusCode === 403) {
        // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
      }
      throw error;
    }
  }

  /**
   * Returns specific user detail.
   * @param {string} id - inum of user
   * @returns {Promise<userDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  async getUser(id: string): Promise<userDetail> {
    if (!id) {
      throw new Error('Provide valid value of id.');
    }
    let scimConfig = await this.getSCIMConfigurations(this.params.domain);
    let rptDetail = await this.getRPTToken(this.params, scimConfig.user_endpoint);
    return await this.getById(scimConfig.user_endpoint, rptDetail.RPT.access_token, id);
  };


  /**
   * To add new user.
   * @param {object} userData - Object of user details
   * @returns {Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  async addUser(userData: userDetail): Promise<userDetail> {
    let scimConfig = await this.getSCIMConfigurations(this.params.domain);
    let rptDetail = await this.getRPTToken(this.params, scimConfig.user_endpoint);
    return await this.insert(scimConfig.user_endpoint, rptDetail.RPT.access_token, userData, 'urn:ietf:params:scim:schemas:core:2.0:User');
  };


  /**
   * To remove user.
   * @param {string} id - inum of user
   * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
   */
  async removeUser(id: string): Promise<any> {
    if (!id)
      throw new Error('Provide valid value of id.');

    let scimConfig = await this.getSCIMConfigurations(this.params.domain);
    let rptDetail = await this.getRPTToken(this.params, scimConfig.user_endpoint);
    return await this._delete(scimConfig.user_endpoint, rptDetail.RPT.access_token, id);
  };


  /**
   * To return groups count.
   * @returns {Promise<number>}
   */
  async getGroupsCount(): Promise<number> {
    return (await this.getGroups(0, 0)).Resources.length;
  };


  /**
   * To return group list.
   * @param {int} startIndex - page index starts with 1.
   * @param {int} count - number of users to be returned.
   * @returns {GluuResponse<Array<userDetail>, error>} - callback or promise that returns users if resolved, or an Error if rejected.
   */
  async getGroups(startIndex: number = 0, count: number = 25): Promise<GluuResponse<groupDetail>> {
    try {
      let scimConfig = await this.getSCIMConfigurations(this.params.domain);
      let rptDetail = await this.getRPTToken(this.params, scimConfig.group_endpoint);
      return await this.get(scimConfig.group_endpoint, rptDetail.RPT.access_token, startIndex, count);
    }
    catch (error) {
      if (error.status === 403) {
        // return authorizeRPT(rptDetail.RPT, rptDetail.AAT, error.error, rptDetail.umaConfiguration.authorization_endpoint);
      }
      throw error;
    }
  }

  /**
   * Returns specific group detail.
   * @param {string} id - inum of user
   * @returns {Promise<userDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  async getGroup(id: string): Promise<userDetail> {
    if (!id) {
      throw new Error('Provide valid value of id.');
    }
    let scimConfig = await this.getSCIMConfigurations(this.params.domain);
    let rptDetail = await this.getRPTToken(this.params, scimConfig.group_endpoint);
    return await this.getById(scimConfig.group_endpoint, rptDetail.RPT.access_token, id);
  };


  /**
   * To add new group.
   * @param {groupDetail} groupData - Object of user details
   * @returns {Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
   */
  async addGroup(groupData: groupDetail): Promise<userDetail> {
    let scimConfig = await this.getSCIMConfigurations(this.params.domain);
    let rptDetail = await this.getRPTToken(this.params, scimConfig.group_endpoint);
    return await this.insert(scimConfig.group_endpoint, rptDetail.RPT.access_token, groupData, 'urn:ietf:params:scim:schemas:core:2.0:Group');
  };


  /**
   * To remove user.
   * @param {string} id - inum of user
   * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
   */
  async removeGroup(id: string): Promise<any> {
    if (!id)
      throw new Error('Provide valid value of id.');

    let scimConfig = await this.getSCIMConfigurations(this.params.domain);
    let rptDetail = await this.getRPTToken(this.params, scimConfig.group_endpoint);
    return await this._delete(scimConfig.group_endpoint, rptDetail.RPT.access_token, id);
  };
}
