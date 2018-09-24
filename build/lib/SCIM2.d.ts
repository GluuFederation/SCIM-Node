import ScimCommon, { GluuResponse, groupDetail, ScimConfig, userDetail } from "./SCIMCommon";
export default class SCIM2 extends ScimCommon {
    constructor(params: ScimConfig);
    /**
     * Gets configurations of UMA from domain URL
     * @param {string} domain - Gluu server domain Url
     * @returns {Promise.<umaConfigurations, error>} - A promise that returns a umaConfigurations if resolved, or an
     * Error if rejected.
     */
    private getUmaConfigurations;
    /**
     * Gets configurations of SCIM 2.0 from domain URL.
     * @param {string} domain - Gluu server domain Url
     * @returns {Promise<scimConfigurations>}
     */
    private getSCIMConfigurations;
    private getTicketAndConfig;
    /**
     * Gets AAT token detail.
     * @param {ScimConfig} config - json of config values of Gluu client
     * @param {string} tokenEndpoint - Token endpoint URL retrieve from UMA configuration.
     * @param ticket
     * @returns {Promise<AATDetails, error>} - A promise that returns a AATDetails if resolved, or an Error if rejected.
     */
    private getToken;
    /**
     *
     * Gets RPT and SCIM details of Gluu client
     * @param {ScimConfig} config - json of config values of Gluu client
     * @param resourceURL
     * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
     */
    private getRPTToken;
    /**
     * @todo never used ?
     * Authorizes RPT token by requesting PAT using ticket number.
     * @param rpt
     * @param {AATDetails} aat - Access token
     * @param {scimResponse} scimResponse - json response of SCIM method call that contains ticket number.
     * @param {string} authorizationEndpoint - Authorization Endpoint URL retrieved from uma configuration
     * @returns {Promise<rptDetails, error>} - A promise that returns a rptDetails if resolved, or an Error if rejected.
     */
    private authorizeRPT;
    /**
     * Retrieves user list or total counts if count is zero or undefined.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {Promise<userDetail, error>} - A promise that returns a usersDetail if resolved, or an Error if
     * rejected.
     */
    private get;
    /**
     * Retrieves specific user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - Inum of user to be retrieve
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private getById;
    /**
     * Insert new user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {object} data - User details to be inserted
     * @param schema
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private insert;
    /**
     * Delete specific user.
     * @param {string} endpoint - User Endpoint URL of SCIM 2.0
     * @param {string} rpt - RPT token received from getRPT
     * @param {string} id - Inum of user to be retrieve
     * @returns {Promise<userDetail, error>} - A promise that returns a userDetail if resolved, or an Error if rejected.
     */
    private _delete;
    /**
     * To return users count.
     * @returns {Promise<number>}
     */
    getUsersCount(): Promise<number>;
    /**
     * To return user list.
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {Promise<Array<userDetail>, error>} - callback or promise that returns users if resolved, or an Error if rejected.
     */
    getUsers(startIndex: number, count: number): Promise<GluuResponse<userDetail>>;
    /**
     * Returns specific user detail.
     * @param {string} id - inum of user
     * @returns {Promise<userDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    getUser(id: string): Promise<userDetail>;
    /**
     * To add new user.
     * @param {object} userData - Object of user details
     * @returns {Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    addUser(userData: userDetail): Promise<userDetail>;
    /**
     * To remove user.
     * @param {string} id - inum of user
     * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
     */
    removeUser(id: string): Promise<any>;
    /**
     * To return groups count.
     * @returns {Promise<number>}
     */
    getGroupsCount(): Promise<number>;
    /**
     * To return group list.
     * @param {int} startIndex - page index starts with 1.
     * @param {int} count - number of users to be returned.
     * @returns {GluuResponse<Array<userDetail>, error>} - callback or promise that returns users if resolved, or an Error if rejected.
     */
    getGroups(startIndex?: number, count?: number): Promise<GluuResponse<groupDetail>>;
    /**
     * Returns specific group detail.
     * @param {string} id - inum of user
     * @returns {Promise<userDetail, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    getGroup(id: string): Promise<userDetail>;
    /**
     * To add new group.
     * @param {groupDetail} groupData - Object of user details
     * @returns {Promise<object, error>} - callback or promise that returns user detail if resolved, or an Error if rejected.
     */
    addGroup(groupData: groupDetail): Promise<userDetail>;
    /**
     * To remove user.
     * @param {string} id - inum of user
     * @returns {Promise<object, error>} - callback or promise that returns empty data if resolved, or an Error if rejected.
     */
    removeGroup(id: string): Promise<any>;
}
