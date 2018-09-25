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
  "es",
  "fr"
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

export interface GluuResponse<T> {
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
  timezone: Timezones,
  active: boolean,
  groups: Array<groupShort>
}

export interface IMail {
  value:string,
  type:string,
  primary:boolean,
}

export interface IAddress {
  type:string,
  streetAddress:string,
  locality:string,
  region:string,
  postalCode:string,
  country:string,
  formatted:string,
  primary:boolean
}

export interface IPhone {
  value:string,
  type:string,
}

export interface IIMS {
  value:string,
  type:string,
}

export interface IRole {
  value:string
}

export interface IEntitlements {
  value:string
}
export interface Ix509Certificates {
  value:string
}

export interface IAddUser {
  externalId?: string,
  userName: string,
  name?: {
    givenName?: string,
    familyName?: string,
    middleName?:string,
    honorificPrefix?:string,
    honorificSuffix?:string
  },
  displayName?: string,
  nickName?: string,
  profileUrl?: string,
  emails?: Array<IMail>,
  addresses?: Array<IAddress>,
  phoneNumbers?: Array<IPhone>,
  ims?: Array<IIMS>,
  userType?: string,
  title?: string,
  preferredLanguage?: PreferredLanguage,
  locale?: Locales,
  active?: boolean,
  password?: string,
  roles?: Array<IRole>,
  entitlements?: Array<IEntitlements>,
  x509Certificates?: Array<Ix509Certificates>
  readonly meta?: {
    created: string,
    lastModified: string,
    version: string,
    location: string
  }
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

export enum Timezones {
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Algiers",
  "Africa/Bissau",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Ceuta",
  "Africa/El_Aaiun",
  "Africa/Johannesburg",
  "Africa/Khartoum",
  "Africa/Lagos",
  "Africa/Maputo",
  "Africa/Monrovia",
  "Africa/Nairobi",
  "Africa/Ndjamena",
  "Africa/Tripoli",
  "Africa/Tunis",
  "Africa/Windhoek",
  "America/Adak",
  "America/Anchorage",
  "America/Araguaina",
  "America/Asuncion",
  "America/Atikokan",
  "America/Bahia_Banderas",
  "America/Bahia",
  "America/Barbados",
  "America/Belem",
  "America/Belize",
  "America/Blanc-Sablon",
  "America/Boa_Vista",
  "America/Bogota",
  "America/Boise",
  "America/Cambridge_Bay",
  "America/Campo_Grande",
  "America/Cancun",
  "America/Caracas",
  "America/Cayenne",
  "America/Cayman",
  "America/Chicago",
  "America/Chihuahua",
  "America/Costa_Rica",
  "America/Creston",
  "America/Cuiaba",
  "America/Curacao",
  "America/Danmarkshavn",
  "America/Dawson_Creek",
  "America/Dawson",
  "America/Denver",
  "America/Detroit",
  "America/Edmonton",
  "America/Eirunepe",
  "America/El_Salvador",
  "America/Fort_Nelson",
  "America/Fortaleza",
  "America/Glace_Bay",
  "America/Godthab",
  "America/Goose_Bay",
  "America/Grand_Turk",
  "America/Guatemala",
  "America/Guayaquil",
  "America/Guyana",
  "America/Halifax",
  "America/Havana",
  "America/Hermosillo",
  "America/Inuvik",
  "America/Iqaluit",
  "America/Jamaica",
  "America/Juneau",
  "America/La_Paz",
  "America/Lima",
  "America/Los_Angeles",
  "America/Maceio",
  "America/Managua",
  "America/Manaus",
  "America/Martinique",
  "America/Matamoros",
  "America/Mazatlan",
  "America/Menominee",
  "America/Merida",
  "America/Metlakatla",
  "America/Mexico_City",
  "America/Miquelon",
  "America/Moncton",
  "America/Monterrey",
  "America/Montevideo",
  "America/Nassau",
  "America/New_York",
  "America/Nipigon",
  "America/Nome",
  "America/Noronha",
  "America/Ojinaga",
  "America/Panama",
  "America/Pangnirtung",
  "America/Paramaribo",
  "America/Phoenix",
  "America/Port_of_Spain",
  "America/Port-au-Prince",
  "America/Porto_Velho",
  "America/Puerto_Rico",
  "America/Rainy_River",
  "America/Rankin_Inlet",
  "America/Recife",
  "America/Regina",
  "America/Resolute",
  "America/Rio_Branco",
  "America/Santa_Isabel",
  "America/Santarem",
  "America/Santiago",
  "America/Santo_Domingo",
  "America/Sao_Paulo",
  "America/Scoresbysund",
  "America/Sitka",
  "America/St_Johns",
  "America/Swift_Current",
  "America/Tegucigalpa",
  "America/Thule",
  "America/Thunder_Bay",
  "America/Tijuana",
  "America/Toronto",
  "America/Vancouver",
  "America/Whitehorse",
  "America/Winnipeg",
  "America/Yakutat",
  "America/Yellowknife",
  "Antarctica/Casey",
  "Antarctica/Davis",
  "Antarctica/DumontDUrville",
  "Antarctica/Macquarie",
  "Antarctica/Mawson",
  "Antarctica/Palmer",
  "Antarctica/Rothera",
  "Antarctica/Syowa",
  "Antarctica/Troll",
  "Antarctica/Vostok",
  "Asia/Almaty",
  "Asia/Amman",
  "Asia/Anadyr",
  "Asia/Aqtau",
  "Asia/Aqtobe",
  "Asia/Ashgabat",
  "Asia/Baghdad",
  "Asia/Baku",
  "Asia/Bangkok",
  "Asia/Beirut",
  "Asia/Bishkek",
  "Asia/Brunei",
  "Asia/Chita",
  "Asia/Choibalsan",
  "Asia/Colombo",
  "Asia/Damascus",
  "Asia/Dhaka",
  "Asia/Dili",
  "Asia/Dubai",
  "Asia/Dushanbe",
  "Asia/Gaza",
  "Asia/Hebron",
  "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong",
  "Asia/Hovd",
  "Asia/Irkutsk",
  "Asia/Jakarta",
  "Asia/Jayapura",
  "Asia/Jerusalem",
  "Asia/Kabul",
  "Asia/Kamchatka",
  "Asia/Karachi",
  "Asia/Kathmandu",
  "Asia/Khandyga",
  "Asia/Kolkata",
  "Asia/Krasnoyarsk",
  "Asia/Kuala_Lumpur",
  "Asia/Kuching",
  "Asia/Macau",
  "Asia/Magadan",
  "Asia/Makassar",
  "Asia/Manila",
  "Asia/Nicosia",
  "Asia/Novokuznetsk",
  "Asia/Novosibirsk",
  "Asia/Omsk",
  "Asia/Oral",
  "Asia/Pontianak",
  "Asia/Pyongyang",
  "Asia/Qatar",
  "Asia/Qyzylorda",
  "Asia/Rangoon",
  "Asia/Riyadh",
  "Asia/Sakhalin",
  "Asia/Samarkand",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Srednekolymsk",
  "Asia/Taipei",
  "Asia/Tashkent",
  "Asia/Tbilisi",
  "Asia/Tehran",
  "Asia/Thimphu",
  "Asia/Tokyo",
  "Asia/Tomsk",
  "Asia/Ulaanbaatar",
  "Asia/Urumqi",
  "Asia/Ust-Nera",
  "Asia/Vladivostok",
  "Asia/Yakutsk",
  "Asia/Yekaterinburg",
  "Asia/Yerevan",
  "Atlantic/Azores",
  "Atlantic/Bermuda",
  "Atlantic/Canary",
  "Atlantic/Cape_Verde",
  "Atlantic/Faroe",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
  "Atlantic/South_Georgia",
  "Atlantic/Stanley",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Broken_Hill",
  "Australia/Currie",
  "Australia/Darwin",
  "Australia/Eucla",
  "Australia/Hobart",
  "Australia/Lindeman",
  "Australia/Lord_Howe",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Andorra",
  "Europe/Athens",
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Brussels",
  "Europe/Bucharest",
  "Europe/Budapest",
  "Europe/Chisinau",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Gibraltar",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/Kaliningrad",
  "Europe/Kiev",
  "Europe/Kirov",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Luxembourg",
  "Europe/Madrid",
  "Europe/Malta",
  "Europe/Minsk",
  "Europe/Monaco",
  "Europe/Moscow",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Riga",
  "Europe/Rome",
  "Europe/Samara",
  "Europe/Simferopol",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Tallinn",
  "Europe/Tirane",
  "Europe/Uzhgorod",
  "Europe/Vienna",
  "Europe/Vilnius",
  "Europe/Volgograd",
  "Europe/Warsaw",
  "Europe/Zaporozhye",
  "Europe/Zurich",
  "Indian/Chagos",
  "Indian/Christmas",
  "Indian/Cocos",
  "Indian/Kerguelen",
  "Indian/Mahe",
  "Indian/Maldives",
  "Indian/Mauritius",
  "Indian/Reunion",
  "Pacific/Apia",
  "Pacific/Auckland",
  "Pacific/Bougainville",
  "Pacific/Chatham",
  "Pacific/Chuuk",
  "Pacific/Easter",
  "Pacific/Efate",
  "Pacific/Enderbury",
  "Pacific/Fakaofo",
  "Pacific/Fiji",
  "Pacific/Funafuti",
  "Pacific/Galapagos",
  "Pacific/Gambier",
  "Pacific/Guadalcanal",
  "Pacific/Guam",
  "Pacific/Honolulu",
  "Pacific/Kiritimati",
  "Pacific/Kosrae",
  "Pacific/Kwajalein",
  "Pacific/Majuro",
  "Pacific/Marquesas",
  "Pacific/Nauru",
  "Pacific/Niue",
  "Pacific/Norfolk",
  "Pacific/Noumea",
  "Pacific/Pago_Pago",
  "Pacific/Palau",
  "Pacific/Pitcairn",
  "Pacific/Pohnpei",
  "Pacific/Port_Moresby",
  "Pacific/Rarotonga",
  "Pacific/Tahiti",
  "Pacific/Tarawa",
  "Pacific/Tongatapu",
  "Pacific/Wake",
  "Pacific/Wallis",
}

export enum Locales {
"zh_CN",
"zh_TW",
"en_US",
"fr_FR",
"de_DE",
"it_IT",
"ja_JP",
"ko_KR",
"pt_BR",
"es_ES",
}

export enum PreferredLanguage {
  "af",
  "sq",
  "ar",
  "ar-dz",
  "ar-bh",
  "ar-eg",
  "ar-iq",
  "ar-jo",
  "ar-kw",
  "ar-lb",
  "ar-ly",
  "ar-ma",
  "ar-om",
  "ar-qa",
  "ar-sa",
  "ar-sy",
  "ar-tn",
  "ar-ae",
  "ar-ye",
  "hy",
  "as",
  "ast",
  "az",
  "eu",
  "bg",
  "be",
  "bn",
  "bs",
  "br",
  "my",
  "ca",
  "ch",
  "ce",
  "zh",
  "zh-hk",
  "zh-cn",
  "zh-sg",
  "zh-tw",
  "cv",
  "co",
  "cr",
  "hr",
  "cs",
  "da",
  "nl",
  "nl-be",
  "en",
  "en-au",
  "en-bz",
  "en-ca",
  "en-ie",
  "en-jm",
  "en-nz",
  "en-ph",
  "en-za",
  "en-tt",
  "en-gb",
  "en-us",
  "en-zw",
  "eo",
  "et",
  "fo",
  "fj",
  "fi",
  "fr",
  "fr-be",
  "fr-ca",
  "fr-fr",
  "fr-lu",
  "fr-mc",
  "fr-ch",
  "fy",
  "fur",
  "gd-ie",
  "gl",
  "ka",
  "de",
  "de-at",
  "de-de",
  "de-li",
  "de-lu",
  "de-ch",
  "el",
  "gu",
  "ht",
  "he",
  "hi",
  "hu",
  "is",
  "id",
  "iu",
  "ga",
  "it",
  "it-ch",
  "ja",
  "kn",
  "ks",
  "kk",
  "km",
  "ky",
  "tlh",
  "ko",
  "ko-kp",
  "ko-kr",
  "la",
  "lv",
  "lt",
  "lb",
  "mk",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "mo",
  "nv",
  "ng",
  "ne",
  "no",
  "nb",
  "nn",
  "oc",
  "or",
  "om",
  "fa",
  "fa-ir",
  "pl",
  "pt",
  "pt-br",
  "pa",
  "pa-in",
  "pa-pk",
  "qu",
  "rm",
  "ro",
  "ro-mo",
  "ru",
  "ru-mo",
  "sz",
  "sg",
  "sa",
  "sc",
  "gd",
  "sd",
  "si",
  "sr",
  "sk",
  "sl",
  "so",
  "sb",
  "es",
  "es-ar",
  "es-bo",
  "es-cl",
  "es-co",
  "es-cr",
  "es-do",
  "es-ec",
  "es-sv",
  "es-gt",
  "es-hn",
  "es-mx",
  "es-ni",
  "es-pa",
  "es-py",
  "es-pe",
  "es-pr",
  "es-es",
  "es-uy",
  "es-ve",
  "sx",
  "sw",
  "sv",
  "sv-fi",
  "sv-sv",
  "ta",
  "tt",
  "te",
  "th",
  "tig",
  "ts",
  "tn",
  "tr",
  "tk",
  "uk",
  "hsb",
  "ur",
  "ve",
  "vi",
  "vo",
  "wa",
  "cy",
  "xh",
  "ji",
  "zu",
}
