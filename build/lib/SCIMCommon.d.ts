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
    "es" = 1,
    "fr" = 2
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
    timezone: Timezones;
    active: boolean;
    groups: Array<groupShort>;
}
export interface IMail {
    value: string;
    type: string;
    primary: boolean;
}
export interface IAddress {
    type: string;
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
    formatted: string;
    primary: boolean;
}
export interface IPhone {
    value: string;
    type: string;
}
export interface IIMS {
    value: string;
    type: string;
}
export interface IRole {
    value: string;
}
export interface IEntitlements {
    value: string;
}
export interface Ix509Certificates {
    value: string;
}
export interface IAddUser {
    externalId?: string;
    userName: string;
    name?: {
        givenName?: string;
        familyName?: string;
        middleName?: string;
        honorificPrefix?: string;
        honorificSuffix?: string;
    };
    displayName?: string;
    nickName?: string;
    profileUrl?: string;
    emails?: Array<IMail>;
    addresses?: Array<IAddress>;
    phoneNumbers?: Array<IPhone>;
    ims?: Array<IIMS>;
    userType?: string;
    title?: string;
    preferredLanguage?: PreferredLanguage;
    locale?: Locales;
    active?: boolean;
    password?: string;
    roles?: Array<IRole>;
    entitlements?: Array<IEntitlements>;
    x509Certificates?: Array<Ix509Certificates>;
    readonly meta?: {
        created: string;
        lastModified: string;
        version: string;
        location: string;
    };
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
export declare enum Timezones {
    "Africa/Abidjan" = 0,
    "Africa/Accra" = 1,
    "Africa/Algiers" = 2,
    "Africa/Bissau" = 3,
    "Africa/Cairo" = 4,
    "Africa/Casablanca" = 5,
    "Africa/Ceuta" = 6,
    "Africa/El_Aaiun" = 7,
    "Africa/Johannesburg" = 8,
    "Africa/Khartoum" = 9,
    "Africa/Lagos" = 10,
    "Africa/Maputo" = 11,
    "Africa/Monrovia" = 12,
    "Africa/Nairobi" = 13,
    "Africa/Ndjamena" = 14,
    "Africa/Tripoli" = 15,
    "Africa/Tunis" = 16,
    "Africa/Windhoek" = 17,
    "America/Adak" = 18,
    "America/Anchorage" = 19,
    "America/Araguaina" = 20,
    "America/Asuncion" = 21,
    "America/Atikokan" = 22,
    "America/Bahia_Banderas" = 23,
    "America/Bahia" = 24,
    "America/Barbados" = 25,
    "America/Belem" = 26,
    "America/Belize" = 27,
    "America/Blanc-Sablon" = 28,
    "America/Boa_Vista" = 29,
    "America/Bogota" = 30,
    "America/Boise" = 31,
    "America/Cambridge_Bay" = 32,
    "America/Campo_Grande" = 33,
    "America/Cancun" = 34,
    "America/Caracas" = 35,
    "America/Cayenne" = 36,
    "America/Cayman" = 37,
    "America/Chicago" = 38,
    "America/Chihuahua" = 39,
    "America/Costa_Rica" = 40,
    "America/Creston" = 41,
    "America/Cuiaba" = 42,
    "America/Curacao" = 43,
    "America/Danmarkshavn" = 44,
    "America/Dawson_Creek" = 45,
    "America/Dawson" = 46,
    "America/Denver" = 47,
    "America/Detroit" = 48,
    "America/Edmonton" = 49,
    "America/Eirunepe" = 50,
    "America/El_Salvador" = 51,
    "America/Fort_Nelson" = 52,
    "America/Fortaleza" = 53,
    "America/Glace_Bay" = 54,
    "America/Godthab" = 55,
    "America/Goose_Bay" = 56,
    "America/Grand_Turk" = 57,
    "America/Guatemala" = 58,
    "America/Guayaquil" = 59,
    "America/Guyana" = 60,
    "America/Halifax" = 61,
    "America/Havana" = 62,
    "America/Hermosillo" = 63,
    "America/Inuvik" = 64,
    "America/Iqaluit" = 65,
    "America/Jamaica" = 66,
    "America/Juneau" = 67,
    "America/La_Paz" = 68,
    "America/Lima" = 69,
    "America/Los_Angeles" = 70,
    "America/Maceio" = 71,
    "America/Managua" = 72,
    "America/Manaus" = 73,
    "America/Martinique" = 74,
    "America/Matamoros" = 75,
    "America/Mazatlan" = 76,
    "America/Menominee" = 77,
    "America/Merida" = 78,
    "America/Metlakatla" = 79,
    "America/Mexico_City" = 80,
    "America/Miquelon" = 81,
    "America/Moncton" = 82,
    "America/Monterrey" = 83,
    "America/Montevideo" = 84,
    "America/Nassau" = 85,
    "America/New_York" = 86,
    "America/Nipigon" = 87,
    "America/Nome" = 88,
    "America/Noronha" = 89,
    "America/Ojinaga" = 90,
    "America/Panama" = 91,
    "America/Pangnirtung" = 92,
    "America/Paramaribo" = 93,
    "America/Phoenix" = 94,
    "America/Port_of_Spain" = 95,
    "America/Port-au-Prince" = 96,
    "America/Porto_Velho" = 97,
    "America/Puerto_Rico" = 98,
    "America/Rainy_River" = 99,
    "America/Rankin_Inlet" = 100,
    "America/Recife" = 101,
    "America/Regina" = 102,
    "America/Resolute" = 103,
    "America/Rio_Branco" = 104,
    "America/Santa_Isabel" = 105,
    "America/Santarem" = 106,
    "America/Santiago" = 107,
    "America/Santo_Domingo" = 108,
    "America/Sao_Paulo" = 109,
    "America/Scoresbysund" = 110,
    "America/Sitka" = 111,
    "America/St_Johns" = 112,
    "America/Swift_Current" = 113,
    "America/Tegucigalpa" = 114,
    "America/Thule" = 115,
    "America/Thunder_Bay" = 116,
    "America/Tijuana" = 117,
    "America/Toronto" = 118,
    "America/Vancouver" = 119,
    "America/Whitehorse" = 120,
    "America/Winnipeg" = 121,
    "America/Yakutat" = 122,
    "America/Yellowknife" = 123,
    "Antarctica/Casey" = 124,
    "Antarctica/Davis" = 125,
    "Antarctica/DumontDUrville" = 126,
    "Antarctica/Macquarie" = 127,
    "Antarctica/Mawson" = 128,
    "Antarctica/Palmer" = 129,
    "Antarctica/Rothera" = 130,
    "Antarctica/Syowa" = 131,
    "Antarctica/Troll" = 132,
    "Antarctica/Vostok" = 133,
    "Asia/Almaty" = 134,
    "Asia/Amman" = 135,
    "Asia/Anadyr" = 136,
    "Asia/Aqtau" = 137,
    "Asia/Aqtobe" = 138,
    "Asia/Ashgabat" = 139,
    "Asia/Baghdad" = 140,
    "Asia/Baku" = 141,
    "Asia/Bangkok" = 142,
    "Asia/Beirut" = 143,
    "Asia/Bishkek" = 144,
    "Asia/Brunei" = 145,
    "Asia/Chita" = 146,
    "Asia/Choibalsan" = 147,
    "Asia/Colombo" = 148,
    "Asia/Damascus" = 149,
    "Asia/Dhaka" = 150,
    "Asia/Dili" = 151,
    "Asia/Dubai" = 152,
    "Asia/Dushanbe" = 153,
    "Asia/Gaza" = 154,
    "Asia/Hebron" = 155,
    "Asia/Ho_Chi_Minh" = 156,
    "Asia/Hong_Kong" = 157,
    "Asia/Hovd" = 158,
    "Asia/Irkutsk" = 159,
    "Asia/Jakarta" = 160,
    "Asia/Jayapura" = 161,
    "Asia/Jerusalem" = 162,
    "Asia/Kabul" = 163,
    "Asia/Kamchatka" = 164,
    "Asia/Karachi" = 165,
    "Asia/Kathmandu" = 166,
    "Asia/Khandyga" = 167,
    "Asia/Kolkata" = 168,
    "Asia/Krasnoyarsk" = 169,
    "Asia/Kuala_Lumpur" = 170,
    "Asia/Kuching" = 171,
    "Asia/Macau" = 172,
    "Asia/Magadan" = 173,
    "Asia/Makassar" = 174,
    "Asia/Manila" = 175,
    "Asia/Nicosia" = 176,
    "Asia/Novokuznetsk" = 177,
    "Asia/Novosibirsk" = 178,
    "Asia/Omsk" = 179,
    "Asia/Oral" = 180,
    "Asia/Pontianak" = 181,
    "Asia/Pyongyang" = 182,
    "Asia/Qatar" = 183,
    "Asia/Qyzylorda" = 184,
    "Asia/Rangoon" = 185,
    "Asia/Riyadh" = 186,
    "Asia/Sakhalin" = 187,
    "Asia/Samarkand" = 188,
    "Asia/Seoul" = 189,
    "Asia/Shanghai" = 190,
    "Asia/Singapore" = 191,
    "Asia/Srednekolymsk" = 192,
    "Asia/Taipei" = 193,
    "Asia/Tashkent" = 194,
    "Asia/Tbilisi" = 195,
    "Asia/Tehran" = 196,
    "Asia/Thimphu" = 197,
    "Asia/Tokyo" = 198,
    "Asia/Tomsk" = 199,
    "Asia/Ulaanbaatar" = 200,
    "Asia/Urumqi" = 201,
    "Asia/Ust-Nera" = 202,
    "Asia/Vladivostok" = 203,
    "Asia/Yakutsk" = 204,
    "Asia/Yekaterinburg" = 205,
    "Asia/Yerevan" = 206,
    "Atlantic/Azores" = 207,
    "Atlantic/Bermuda" = 208,
    "Atlantic/Canary" = 209,
    "Atlantic/Cape_Verde" = 210,
    "Atlantic/Faroe" = 211,
    "Atlantic/Madeira" = 212,
    "Atlantic/Reykjavik" = 213,
    "Atlantic/South_Georgia" = 214,
    "Atlantic/Stanley" = 215,
    "Australia/Adelaide" = 216,
    "Australia/Brisbane" = 217,
    "Australia/Broken_Hill" = 218,
    "Australia/Currie" = 219,
    "Australia/Darwin" = 220,
    "Australia/Eucla" = 221,
    "Australia/Hobart" = 222,
    "Australia/Lindeman" = 223,
    "Australia/Lord_Howe" = 224,
    "Australia/Melbourne" = 225,
    "Australia/Perth" = 226,
    "Australia/Sydney" = 227,
    "Europe/Amsterdam" = 228,
    "Europe/Andorra" = 229,
    "Europe/Athens" = 230,
    "Europe/Belgrade" = 231,
    "Europe/Berlin" = 232,
    "Europe/Brussels" = 233,
    "Europe/Bucharest" = 234,
    "Europe/Budapest" = 235,
    "Europe/Chisinau" = 236,
    "Europe/Copenhagen" = 237,
    "Europe/Dublin" = 238,
    "Europe/Gibraltar" = 239,
    "Europe/Helsinki" = 240,
    "Europe/Istanbul" = 241,
    "Europe/Kaliningrad" = 242,
    "Europe/Kiev" = 243,
    "Europe/Kirov" = 244,
    "Europe/Lisbon" = 245,
    "Europe/London" = 246,
    "Europe/Luxembourg" = 247,
    "Europe/Madrid" = 248,
    "Europe/Malta" = 249,
    "Europe/Minsk" = 250,
    "Europe/Monaco" = 251,
    "Europe/Moscow" = 252,
    "Europe/Oslo" = 253,
    "Europe/Paris" = 254,
    "Europe/Prague" = 255,
    "Europe/Riga" = 256,
    "Europe/Rome" = 257,
    "Europe/Samara" = 258,
    "Europe/Simferopol" = 259,
    "Europe/Sofia" = 260,
    "Europe/Stockholm" = 261,
    "Europe/Tallinn" = 262,
    "Europe/Tirane" = 263,
    "Europe/Uzhgorod" = 264,
    "Europe/Vienna" = 265,
    "Europe/Vilnius" = 266,
    "Europe/Volgograd" = 267,
    "Europe/Warsaw" = 268,
    "Europe/Zaporozhye" = 269,
    "Europe/Zurich" = 270,
    "Indian/Chagos" = 271,
    "Indian/Christmas" = 272,
    "Indian/Cocos" = 273,
    "Indian/Kerguelen" = 274,
    "Indian/Mahe" = 275,
    "Indian/Maldives" = 276,
    "Indian/Mauritius" = 277,
    "Indian/Reunion" = 278,
    "Pacific/Apia" = 279,
    "Pacific/Auckland" = 280,
    "Pacific/Bougainville" = 281,
    "Pacific/Chatham" = 282,
    "Pacific/Chuuk" = 283,
    "Pacific/Easter" = 284,
    "Pacific/Efate" = 285,
    "Pacific/Enderbury" = 286,
    "Pacific/Fakaofo" = 287,
    "Pacific/Fiji" = 288,
    "Pacific/Funafuti" = 289,
    "Pacific/Galapagos" = 290,
    "Pacific/Gambier" = 291,
    "Pacific/Guadalcanal" = 292,
    "Pacific/Guam" = 293,
    "Pacific/Honolulu" = 294,
    "Pacific/Kiritimati" = 295,
    "Pacific/Kosrae" = 296,
    "Pacific/Kwajalein" = 297,
    "Pacific/Majuro" = 298,
    "Pacific/Marquesas" = 299,
    "Pacific/Nauru" = 300,
    "Pacific/Niue" = 301,
    "Pacific/Norfolk" = 302,
    "Pacific/Noumea" = 303,
    "Pacific/Pago_Pago" = 304,
    "Pacific/Palau" = 305,
    "Pacific/Pitcairn" = 306,
    "Pacific/Pohnpei" = 307,
    "Pacific/Port_Moresby" = 308,
    "Pacific/Rarotonga" = 309,
    "Pacific/Tahiti" = 310,
    "Pacific/Tarawa" = 311,
    "Pacific/Tongatapu" = 312,
    "Pacific/Wake" = 313,
    "Pacific/Wallis" = 314
}
export declare enum Locales {
    "zh_CN" = 0,
    "zh_TW" = 1,
    "en_US" = 2,
    "fr_FR" = 3,
    "de_DE" = 4,
    "it_IT" = 5,
    "ja_JP" = 6,
    "ko_KR" = 7,
    "pt_BR" = 8,
    "es_ES" = 9
}
export declare enum PreferredLanguage {
    "af" = 0,
    "sq" = 1,
    "ar" = 2,
    "ar-dz" = 3,
    "ar-bh" = 4,
    "ar-eg" = 5,
    "ar-iq" = 6,
    "ar-jo" = 7,
    "ar-kw" = 8,
    "ar-lb" = 9,
    "ar-ly" = 10,
    "ar-ma" = 11,
    "ar-om" = 12,
    "ar-qa" = 13,
    "ar-sa" = 14,
    "ar-sy" = 15,
    "ar-tn" = 16,
    "ar-ae" = 17,
    "ar-ye" = 18,
    "hy" = 19,
    "as" = 20,
    "ast" = 21,
    "az" = 22,
    "eu" = 23,
    "bg" = 24,
    "be" = 25,
    "bn" = 26,
    "bs" = 27,
    "br" = 28,
    "my" = 29,
    "ca" = 30,
    "ch" = 31,
    "ce" = 32,
    "zh" = 33,
    "zh-hk" = 34,
    "zh-cn" = 35,
    "zh-sg" = 36,
    "zh-tw" = 37,
    "cv" = 38,
    "co" = 39,
    "cr" = 40,
    "hr" = 41,
    "cs" = 42,
    "da" = 43,
    "nl" = 44,
    "nl-be" = 45,
    "en" = 46,
    "en-au" = 47,
    "en-bz" = 48,
    "en-ca" = 49,
    "en-ie" = 50,
    "en-jm" = 51,
    "en-nz" = 52,
    "en-ph" = 53,
    "en-za" = 54,
    "en-tt" = 55,
    "en-gb" = 56,
    "en-us" = 57,
    "en-zw" = 58,
    "eo" = 59,
    "et" = 60,
    "fo" = 61,
    "fj" = 62,
    "fi" = 63,
    "fr" = 64,
    "fr-be" = 65,
    "fr-ca" = 66,
    "fr-fr" = 67,
    "fr-lu" = 68,
    "fr-mc" = 69,
    "fr-ch" = 70,
    "fy" = 71,
    "fur" = 72,
    "gd-ie" = 73,
    "gl" = 74,
    "ka" = 75,
    "de" = 76,
    "de-at" = 77,
    "de-de" = 78,
    "de-li" = 79,
    "de-lu" = 80,
    "de-ch" = 81,
    "el" = 82,
    "gu" = 83,
    "ht" = 84,
    "he" = 85,
    "hi" = 86,
    "hu" = 87,
    "is" = 88,
    "id" = 89,
    "iu" = 90,
    "ga" = 91,
    "it" = 92,
    "it-ch" = 93,
    "ja" = 94,
    "kn" = 95,
    "ks" = 96,
    "kk" = 97,
    "km" = 98,
    "ky" = 99,
    "tlh" = 100,
    "ko" = 101,
    "ko-kp" = 102,
    "ko-kr" = 103,
    "la" = 104,
    "lv" = 105,
    "lt" = 106,
    "lb" = 107,
    "mk" = 108,
    "ms" = 109,
    "ml" = 110,
    "mt" = 111,
    "mi" = 112,
    "mr" = 113,
    "mo" = 114,
    "nv" = 115,
    "ng" = 116,
    "ne" = 117,
    "no" = 118,
    "nb" = 119,
    "nn" = 120,
    "oc" = 121,
    "or" = 122,
    "om" = 123,
    "fa" = 124,
    "fa-ir" = 125,
    "pl" = 126,
    "pt" = 127,
    "pt-br" = 128,
    "pa" = 129,
    "pa-in" = 130,
    "pa-pk" = 131,
    "qu" = 132,
    "rm" = 133,
    "ro" = 134,
    "ro-mo" = 135,
    "ru" = 136,
    "ru-mo" = 137,
    "sz" = 138,
    "sg" = 139,
    "sa" = 140,
    "sc" = 141,
    "gd" = 142,
    "sd" = 143,
    "si" = 144,
    "sr" = 145,
    "sk" = 146,
    "sl" = 147,
    "so" = 148,
    "sb" = 149,
    "es" = 150,
    "es-ar" = 151,
    "es-bo" = 152,
    "es-cl" = 153,
    "es-co" = 154,
    "es-cr" = 155,
    "es-do" = 156,
    "es-ec" = 157,
    "es-sv" = 158,
    "es-gt" = 159,
    "es-hn" = 160,
    "es-mx" = 161,
    "es-ni" = 162,
    "es-pa" = 163,
    "es-py" = 164,
    "es-pe" = 165,
    "es-pr" = 166,
    "es-es" = 167,
    "es-uy" = 168,
    "es-ve" = 169,
    "sx" = 170,
    "sw" = 171,
    "sv" = 172,
    "sv-fi" = 173,
    "sv-sv" = 174,
    "ta" = 175,
    "tt" = 176,
    "te" = 177,
    "th" = 178,
    "tig" = 179,
    "ts" = 180,
    "tn" = 181,
    "tr" = 182,
    "tk" = 183,
    "uk" = 184,
    "hsb" = 185,
    "ur" = 186,
    "ve" = 187,
    "vi" = 188,
    "vo" = 189,
    "wa" = 190,
    "cy" = 191,
    "xh" = 192,
    "ji" = 193,
    "zu" = 194
}
