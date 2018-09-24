export enum response_types_supported {
  code = "code",
  id_token = "id_token",
  token = "token"
}

export enum grant_types_supported {
  "authorization_code" = "authorization_code",
  "implicit" = "implicit",
  "client_credentials" = "client_credentials",
  "urn:ietf:params:oauth:grant-type:uma-ticket" = "urn:ietf:params:oauth:grant-type:uma-ticket"
}

export enum token_endpoint_auth_methods_supported {
  "client_secret_basic" = "client_secret_basic",
  "client_secret_post" = "client_secret_post",
  "client_secret_jwt" = "client_secret_jwt",
  "private_key_jwt" = "private_key_jwt",
}

export enum token_endpoint_auth_signing_alg_values_supported {
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
}

export enum ui_locales_supported {
  "en",
  "es"
}

export interface umaConfigurations {
  issuer: string,
  authorization_endpoint: string,
  jwks_uri: string,
  registration_endpoint: string,
  response_types_supported: Array<response_types_supported>,
  grant_types_supported: Array<grant_types_supported>,
  token_endpoint_auth_methods_supported: Array<token_endpoint_auth_methods_supported>,
  token_endpoint_auth_signing_alg_values_supported: Array<token_endpoint_auth_signing_alg_values_supported>,
  service_documentation: string,
  ui_locales_supported: Array<ui_locales_supported>,
  op_policy_uri: string,
  op_tos_uri: string,
  introspection_endpoint: string,
  code_challenge_methods_supported: null,
  claims_interaction_endpoint: string,
  uma_profiles_supported: [],
  permission_endpoint: string,
  resource_registration_endpoint: string,
  scope_endpoint: string
  token_endpoint: string
}

export enum authorizations_supported {
  uma = "uma"
}

export interface scimConfigurations {
  version: string,
  user_endpoint: string,
  group_endpoint: string,
  authorization_supported: Array<authorizations_supported>,
  bulk_endpoint: string,
  service_provider_endpoint: string,
  resource_types_endpoint: string,
  fido_devices_endpoint: string,
  schemas_endpoint: string,
}

export interface GluuResponse<T>{
  schemas: Array<schemas>,
  totalResults: number,
  startIndex: number,
  itemsPerPage: number,
  Resources: Array<T>
}

export interface ScimConfig {
  /**
   * Algorithm type.
   */
  keyAlg: JWTAlgorithm | string,
  /**
   * Gluu server URL.
   */
  domain: string,
  /**
   * Value can be buffer or path of private key.
   */
  // @ts-ignore
  privateKey: Buffer | string,
  /**
   * UMA client id
   */
  clientId: string,
  /**
   * oxAuth JWKS key id.
   */
  keyId: string,

  /**
   * use scimTestModeAuthentication
   */
  scimTestMode?: boolean
  /**
   * if scimTestMode, provide the userPassword
   */
  userPassword?: string
}

// come from here : https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback (algorithm supported)
export enum JWTAlgorithm {
  HS256 = "HS256",
  HS384 = "HS384",
}

////////////////////////////////
// need to add details        //
////////////////////////////////
export interface rptDetails {
  umaConfiguration?: umaConfigurations,
  ticket?: ticket,
  RPT?: AATDetails
}

export interface ticket {
  ticket: string
  as_URI: string
}

export interface AATDetails {
  access_token: string
  token_type: string,
  expires_in: number
}

export interface scimResponse {
  ticket: ticket
}

export enum schemas {
  group = "urn:ietf:params:scim:schemas:core:2.0:Group",
  user = "urn:ietf:params:scim:schemas:core:2.0:User",
  listResponse = "urn:ietf:params:scim:api:messages:2.0:ListResponse"
}

export interface userDetail {
  schemas: Array<schemas>,
  id: string,
  meta: {
    resourceType: string,
    lastModified: string,
    location: string
  },
  userName: string,
  name: {
    familyName: string,
    givenName: string,
    middleName: string,
    formatted: string
  },
  displayName: string,
  nickName: string,
  locale: ui_locales_supported,
  timezone: string,
  active: boolean,
  groups: Array<groupShort>
}

export interface groupShort {
  value: string,
  display: string,
  type: string,
  $ref: string
}


export interface userShort {
  value: string,
  type: string,
  display: string,
  $ref: string,
}

export interface groupDetail {
  schemas: Array<schemas>,
  id: string,
  meta: {
    resourceType: string,
    location: string
  },
  displayName: string,
  members: Array<userShort>
}

////////////////////////////////
// /need to add details        //
////////////////////////////////


export default class ScimCommon {
  protected params: ScimConfig;

  constructor(params: ScimConfig) {
    this.params = params;
  }

  // /**
  //  * Gets configurations of UMA from domain URL
  //  * @param {string} domain - Gluu server domain Url
  //  * @returns {Promise.<umaConfigurations, error>} - A promise that returns a umaConfigurations if resolved, or an
  //  * Error if rejected.
  //  */
  // private getUmaConfigurations(domain: string): Promise<umaConfigurations>{
  //
  // }
  //
  // /**
  //  * Gets configurations of SCIM 2.0 from domain URL.
  //  * @param {string} domain - Gluu server domain Url
  //  * @returns {Promise.<scimConfigurations, error>} - A promise that returns a scimConfigurations if resolved, or an
  //  * Error if rejected.
  //  */
  // private getSCIMConfigurations(domain: string): Promise<scimConfigurations>{
  //
  // }
  //
  // /**
  //  * Authorizes RPT token by requesting PAT using ticket number.
  //  * @param rpt
  //  * @param {GUID} aat - Access token
  //  * @param {json} scimResponse - json response of SCIM method call that contains ticket number.
  //  * @param {string} authorizationEndpoint - Authorization Endpoint URL retrieved from uma configuration
  //  * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
  //  */
  // private authorizeRPT(rpt, aat, scimResponse: scimResponse, authorizationEndpoint): Promise<rptDetails>{
  //
  // }
  //
  // /**
  //  * To return users count.
  //  * @returns {Promise<userDetail, error>} - callback or promise that returns users count if resolved,
  //  * or an Error if rejected.
  //  */
  // getUsersCount(): Promise<userDetail>{
  //
  // }
  //
  // /**
  //  * To return user list.
  //  * @param {int} startIndex - page index starts with 1.
  //  * @param {int} count - number of users to be returned.
  //  * @returns {Promise<Array<userDetail>, error>} - callback or promise that returns users if resolved, or an Error if rejected.
  //  */
  // getUsers(startIndex: number, count: number): Promise<Array<userDetail>>{
  //
  // }
  //
  // /**
  //  * To remove user.
  //  * @param {string} id - inum of user
  //  * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
  //  */
  // removeUser(id: string): Promise<any>{
  //
  // }
  //
  // /**
  //  * Returns specific user detail.
  //  * @param {string} id - inum of user
  //  * @returns {Promise<userDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
  //  */
  // getUser(id: string): Promise<userDetail>{
  //
  // }
}
