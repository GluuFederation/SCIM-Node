"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var response_types_supported;
(function (response_types_supported) {
    response_types_supported["code"] = "code";
    response_types_supported["id_token"] = "id_token";
    response_types_supported["token"] = "token";
})(response_types_supported = exports.response_types_supported || (exports.response_types_supported = {}));
var grant_types_supported;
(function (grant_types_supported) {
    grant_types_supported["authorization_code"] = "authorization_code";
    grant_types_supported["implicit"] = "implicit";
    grant_types_supported["client_credentials"] = "client_credentials";
    grant_types_supported["urn:ietf:params:oauth:grant-type:uma-ticket"] = "urn:ietf:params:oauth:grant-type:uma-ticket";
})(grant_types_supported = exports.grant_types_supported || (exports.grant_types_supported = {}));
var token_endpoint_auth_methods_supported;
(function (token_endpoint_auth_methods_supported) {
    token_endpoint_auth_methods_supported["client_secret_basic"] = "client_secret_basic";
    token_endpoint_auth_methods_supported["client_secret_post"] = "client_secret_post";
    token_endpoint_auth_methods_supported["client_secret_jwt"] = "client_secret_jwt";
    token_endpoint_auth_methods_supported["private_key_jwt"] = "private_key_jwt";
})(token_endpoint_auth_methods_supported = exports.token_endpoint_auth_methods_supported || (exports.token_endpoint_auth_methods_supported = {}));
var token_endpoint_auth_signing_alg_values_supported;
(function (token_endpoint_auth_signing_alg_values_supported) {
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["HS256"] = 0] = "HS256";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["HS384"] = 1] = "HS384";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["HS512"] = 2] = "HS512";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["RS256"] = 3] = "RS256";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["RS384"] = 4] = "RS384";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["RS512"] = 5] = "RS512";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["ES256"] = 6] = "ES256";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["ES384"] = 7] = "ES384";
    token_endpoint_auth_signing_alg_values_supported[token_endpoint_auth_signing_alg_values_supported["ES512"] = 8] = "ES512";
})(token_endpoint_auth_signing_alg_values_supported = exports.token_endpoint_auth_signing_alg_values_supported || (exports.token_endpoint_auth_signing_alg_values_supported = {}));
var ui_locales_supported;
(function (ui_locales_supported) {
    ui_locales_supported[ui_locales_supported["en"] = 0] = "en";
    ui_locales_supported[ui_locales_supported["es"] = 1] = "es";
})(ui_locales_supported = exports.ui_locales_supported || (exports.ui_locales_supported = {}));
var authorizations_supported;
(function (authorizations_supported) {
    authorizations_supported["uma"] = "uma";
})(authorizations_supported = exports.authorizations_supported || (exports.authorizations_supported = {}));
// come from here : https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback (algorithm supported)
var JWTAlgorithm;
(function (JWTAlgorithm) {
    JWTAlgorithm["HS256"] = "HS256";
    JWTAlgorithm["HS384"] = "HS384";
})(JWTAlgorithm = exports.JWTAlgorithm || (exports.JWTAlgorithm = {}));
var schemas;
(function (schemas) {
    schemas["group"] = "urn:ietf:params:scim:schemas:core:2.0:Group";
    schemas["user"] = "urn:ietf:params:scim:schemas:core:2.0:User";
    schemas["listResponse"] = "urn:ietf:params:scim:api:messages:2.0:ListResponse";
})(schemas = exports.schemas || (exports.schemas = {}));
////////////////////////////////
// /need to add details        //
////////////////////////////////
class ScimCommon {
    constructor(params) {
        this.params = params;
    }
}
exports.default = ScimCommon;
//# sourceMappingURL=SCIMCommon.js.map