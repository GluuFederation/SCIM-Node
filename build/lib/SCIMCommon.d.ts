/// <reference types="node" />
export declare enum response_types_supported {
    code = "code",
    id_token = "id_token",
    token = "token"
}
export declare enum grant_types_supported {
    "authorization_code" = "authorization_code",
    "implicit" = "implicit",
    "client_credentials" = "client_credentials",
    "urn:ietf:params:oauth:grant-type:uma-ticket" = "urn:ietf:params:oauth:grant-type:uma-ticket"
}
export declare enum token_endpoint_auth_methods_supported {
    "client_secret_basic" = "client_secret_basic",
    "client_secret_post" = "client_secret_post",
    "client_secret_jwt" = "client_secret_jwt",
    "private_key_jwt" = "private_key_jwt"
}
export declare enum token_endpoint_auth_signing_alg_values_supported {
    "HS256" = 0,
    "HS384" = 1,
    "HS512" = 2,
    "RS256" = 3,
    "RS384" = 4,
    "RS512" = 5,
    "ES256" = 6,
    "ES384" = 7,
    "ES512" = 8
}
export declare enum ui_locales_supported {
    "en" = 0,
    "es" = 1
}
export interface umaConfigurations {
    issuer: string;
    authorization_endpoint: string;
    jwks_uri: string;
    registration_endpoint: string;
    response_types_supported: Array<response_types_supported>;
    grant_types_supported: Array<grant_types_supported>;
    token_endpoint_auth_methods_supported: Array<token_endpoint_auth_methods_supported>;
    token_endpoint_auth_signing_alg_values_supported: Array<token_endpoint_auth_signing_alg_values_supported>;
    service_documentation: string;
    ui_locales_supported: Array<ui_locales_supported>;
    op_policy_uri: string;
    op_tos_uri: string;
    introspection_endpoint: string;
    code_challenge_methods_supported: null;
    claims_interaction_endpoint: string;
    uma_profiles_supported: [];
    permission_endpoint: string;
    resource_registration_endpoint: string;
    scope_endpoint: string;
    token_endpoint: string;
}
export declare enum authorizations_supported {
    uma = "uma"
}
export interface scimConfigurations {
    version: string;
    user_endpoint: string;
    group_endpoint: string;
    authorization_supported: Array<authorizations_supported>;
    bulk_endpoint: string;
    service_provider_endpoint: string;
    resource_types_endpoint: string;
    fido_devices_endpoint: string;
    schemas_endpoint: string;
}
export interface GluuResponse<T> {
    schemas: Array<schemas>;
    totalResults: number;
    startIndex: number;
    itemsPerPage: number;
    Resources: Array<T>;
}
export interface ScimConfig {
    /**
     * Algorithm type.
     */
    keyAlg: JWTAlgorithm | string;
    /**
     * Gluu server URL.
     */
    domain: string;
    /**
     * Value can be buffer or path of private key.
     */
    privateKey: Buffer | string;
    /**
     * UMA client id
     */
    clientId: string;
    /**
     * oxAuth JWKS key id.
     */
    keyId: string;
    /**
     * use scimTestModeAuthentication
     */
    scimTestMode?: boolean;
    /**
     * if scimTestMode, provide the userPassword
     */
    userPassword?: string;
}
export declare enum JWTAlgorithm {
    HS256 = "HS256",
    HS384 = "HS384"
}
export interface rptDetails {
    umaConfiguration?: umaConfigurations;
    ticket?: ticket;
    RPT?: AATDetails;
}
export interface ticket {
    ticket: string;
    as_URI: string;
}
export interface AATDetails {
    access_token: string;
    token_type: string;
    expires_in: number;
}
export interface scimResponse {
    ticket: ticket;
}
export declare enum schemas {
    group = "urn:ietf:params:scim:schemas:core:2.0:Group",
    user = "urn:ietf:params:scim:schemas:core:2.0:User",
    listResponse = "urn:ietf:params:scim:api:messages:2.0:ListResponse"
}
export interface userDetail {
    schemas: Array<schemas>;
    id: string;
    meta: {
        resourceType: string;
        lastModified: string;
        location: string;
    };
    userName: string;
    name: {
        familyName: string;
        givenName: string;
        middleName: string;
        formatted: string;
    };
    displayName: string;
    nickName: string;
    locale: ui_locales_supported;
    timezone: string;
    active: boolean;
    groups: Array<groupShort>;
}
export interface groupShort {
    value: string;
    display: string;
    type: string;
    $ref: string;
}
export interface userShort {
    value: string;
    type: string;
    display: string;
    $ref: string;
}
export interface groupDetail {
    schemas: Array<schemas>;
    id: string;
    meta: {
        resourceType: string;
        location: string;
    };
    displayName: string;
    members: Array<userShort>;
}
export default class ScimCommon {
    protected params: ScimConfig;
    constructor(params: ScimConfig);
}
