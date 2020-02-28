// Type definitions for scim-node 2.1
// Project: https://github.com/GluuFederation/scim-node#readme
// Definitions by: Thibaut SEVERAC <https://github.com/thib3113>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/*~ If this module has methods, declare them as functions like so.
*/
export default function ScimNode(config: ScimConfig): SCIMCombine

export interface umaConfigurations {

}


interface scimConfigurations {

}

interface gluuConfig {

}

// come from here : https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback (algorithm supported)
declare enum JWTAlgorithm {
    HS256 = "HS256",
    HS384 = "HS384",
}

interface ICallback {
    (param: object | Error): void;
}

////////////////////////////////
// need to add details        //
////////////////////////////////
interface rptDetails {
}

interface ticket {
}

interface AATDetails {
}

interface scimResponse {
}

interface userDetail {
}

interface groupDetail {
}

////////////////////////////////
// /need to add details        //
////////////////////////////////

declare abstract class ScimCommon {
    /**
     * Gets configurations of UMA from domain URL
     * @param {string} domain - Gluu server domain Url
     * @returns {Promise.<umaConfigurations, error>} - A promise that returns a umaConfigurations if resolved, or an
     * Error if rejected.
     */
    private getUmaConfigurations(domain: string): Promise<umaConfigurations>

    /**
     * Gets configurations of SCIM 2.0 from domain URL.
     * @param {string} domain - Gluu server domain Url
     * @returns {Promise.<scimConfigurations, error>} - A promise that returns a scimConfigurations if resolved, or an
     * Error if rejected.
     */
    private getSCIMConfigurations(domain: string): Promise<scimConfigurations>

    /**
     * Authorizes RPT token by requesting PAT using ticket number.
     * @param rpt
     * @param {GUID} aat - Access token
     * @param {json} scimResponse - json response of SCIM method call that contains ticket number.
     * @param {string} authorizationEndpoint - Authorization Endpoint URL retrieved from uma configuration
     * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
     */
    private authorizeRPT(rpt, aat, scimResponse: scimResponse, authorizationEndpoint): Promise<rptDetails>

    /**
     * To return users count.
     * @returns {Promise<userDetail, error>} - callback or promise that returns users count if resolved,
     * or an Error if rejected.
     */
    getUsersCount(): Promise<userDetail>

    /**
     * To return users count.
     * @param [callback] - The callback that handles the response and Error.
     * callback or promise that returns users count if resolved,
     * or an Error if rejected.
     */
    getUsersCount(callback: ICallback): void

    /**
     * To return user list.
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {Promise<Array<userDetail>, error>} - callback or promise that returns users if resolved, or an Error if rejected.
     */
    getUsers(startIndex: number, count: number): Promise<Array<userDetail>>
    /**
     * To return user list.
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     * @returns
     */
    getUsers(startIndex: number, count: number, callback: ICallback): void

    /**
     * To remove user.
     * @param {string} id - inum of user
     * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
     */
    removeUser(id: string): Promise<any>

    /**
     * To remove user.
     * @param {string} id - inum of user
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    removeUser(id: string, callback: ICallback): void

    /**
     * Returns specific user detail.
     * @param {string} id - inum of user
     * @returns {Promise<userDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    getUser(id: string): Promise<userDetail>

    /**
     * Returns specific user detail.
     * @param {string} id - inum of user
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    getUser(id: string, callback: ICallback): void
}

declare class Scim2 extends ScimCommon {
    private getTicketAndConfig(resourceURL: string): Promise<any>

    /**
     * Gets AAT token detail.
     * @param {gluuConfig} config - json of config values of Gluu client
     * @param {string} tokenEndpoint - Token endpoint URL retrieve from UMA configuration.
     * @param ticket
     * @returns {Promise<AATDetails, error>} - A promise that returns a AATDetails if resolved, or an Error if rejected.
     */
    private getToken(config: gluuConfig, tokenEndpoint: string, ticket: ticket): Promise<AATDetails>

    /**
     * @todo config ne semble pas être une string
     *
     * Gets RPT and SCIM details of Gluu client
     * @param {string} config - json of config values of Gluu client
     * @param resourceURL
     * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
     */
    private getRPTToken(config: string, resourceURL: string): Promise<rptDetails>


    /**
     * Retrieves user list or total counts if count is zero or undefined.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {Promise<userDetail, error>} - A promise that returns a usersDetail if resolved, or an Error if
     * rejected.
     */
    private get(endpoint: string, rpt: string, startIndex: number, count: number): Promise<Array<userDetail>>

    /**
     * Retrieves specific user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - Inum of user to be retrieve
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private getById(endpoint: string, rpt: string, id: string): Promise<userDetail>

    /**
     * Delete specific user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - Inum of user to be retrieve
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private _delete(endpoint, rpt, id): Promise<userDetail>

    /**
     * Search users.
     * @param {string} endpoint - User or Group Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} filter - Search filters
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {requestCallback|Promise<object, error>} - callback or promise that returns users if resolved, or an Error if rejected.
     */
    private search(endpoint: string, rpt: string, filter: string, startIndex: number, count: number, schema: string): Promise<Array<userDetail>>


  /**
     * To add new user.
     * @param {object} userData - Object of user details
     * @returns {Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    addUser(userData: userDetail): Promise<userDetail>

    /**
     * To add new user.
     * @param {object} userData - Object of user details
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    addUser(userData: userDetail, callback: ICallback): void


    /**
     * Insert new user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {object} data - User details to be inserted
     * @param schema
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private insert(endpoint, rpt, data, schema): Promise<userDetail>

    /**
     * To return group count.
     * @returns {Promise<object, error>} - callback or promise that returns groups count if resolved,
     * or an Error if rejected.
     */
    getGroupCount(): Promise<number>

    /**
     * To return group count.
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    getGroupCount(callback: ICallback): void


    /**
     * To return getGroups list.
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of getGroups to be returned.
     * @returns {Promise<object, error>} - callback or promise that returns getGroups if resolved, or an Error if rejected.
     */
    getGroups(startIndex: number, count: number): Promise<Array<groupDetail>>

    /**
     * To return getGroups list.
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of getGroups to be returned.
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     * @returns {Promise<object, error>} - callback or promise that returns getGroups if resolved, or an Error if rejected.
     */
    getGroups(startIndex: number, count: number, callback: ICallback): void

    /**
     * Returns specific user detail.
     * @param {string} id - inum of user
     * @returns {Promise<groupDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    getGroup(id: string): Promise<groupDetail>

    /**
     * Returns specific user detail.
     * @param {string} id - inum of user
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    getGroup(id: string, callback: ICallback): void

    /**
     * To add new user.
     * @param groupData
     * @returns {Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    addGroup(groupData: groupDetail): Promise<any>

    /**
     * To add new user.
     * @param groupData
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    addGroup(groupData: groupDetail, callback: ICallback): void

    /**
     * To remove user.
     * @param {string} id - inum of user
     * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
     */
    removeGroup(id: string): Promise<any>

    /**
     * To remove user.
     * @param {string} id - inum of user
     * @param {ICallback} [callback] - The callback that handles the response and Error.
     */
    removeGroup(id: string, callback: ICallback): void
}


declare class Scim1 extends ScimCommon {
    /**
     * Gets AAT token detail.
     * @param {json} config - json of config values of Gluu client
     * @param {string} tokenEndpoint - Token endpoint URL retrieve from UMA configuration.
     * @returns {Promise<AATDetails, error>} - A promise that returns a AATDetails if resolved, or an Error if rejected.
     */
    private getAAT(config: gluuConfig, tokenEndpoint: string): Promise<AATDetails>

    /**
     * Retrieves user list or total counts if count is zero or undefined.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {Promise<userDetail, error>} - A promise that returns a usersDetail if resolved, or an Error if
     * rejected.
     */
    private retrieveUsers(endpoint: string, rpt: string, startIndex: number, count: number): Promise<Array<userDetail>>

    /**
     * Gets RPT token detail.
     * @param {string} accessToken - Access token value retrieve from getAAT
     * @param {string} rptEndpoint - RPT endpoint URL retrieve from UMA configuration.
     * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
     */
    getRPT(accessToken: string, rptEndpoint: string): Promise<rptDetails>

    /**
     * @todo config ne semble pas être une string
     *
     * Gets RPT and SCIM details of Gluu client
     * @param {string} config - json of config values of Gluu client
     * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
     */
    private getRPTToken(config: string): Promise<rptDetails>

    /**
     * Retrieves specific user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - Inum of user to be retrieve
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private retrieveUsers(endpoint: string, rpt: string, id: string): Promise<userDetail>

    /**
     * Delete specific user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - Inum of user to be retrieve
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private deleteUser(endpoint, rpt, id): Promise<userDetail>


    /**
     * Insert new user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {object} data - User details to be inserted
     * @param schema
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private insertUser(endpoint, rpt, data, schema): Promise<userDetail>

    /**
     * To send search user query.
     * @param {string} filter - Filter string
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @param {requestCallback} [callback] - The callback that handles the response and Error.
     * @returns {requestCallback|Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    private searchUsers(filter: string, startIndex: number, count: number, callback: ICallback): Promise<Array<userDetail>>
}

interface ScimConfig {
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
}

interface SCIMCombine {
    scim: Scim1;
    scim2: Scim2
}

//
// interface ScimNode {
//     (config: ScimConfig): SCIMCombine;
// }
//
// const ScimNode: ScimNode;
//
// export default ScimNode;
