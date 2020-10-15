var config = {
    keyAlg: 'XXXXX', // Algorithm type.
    domain: 'https://example.com', // Gluu server URL.
    privateKey: 'final-private-key.key', // Value can be buffer or path of private key.
    clientId: '@!XXXX.XXXX.XXXX.XXXX!XXXX!XXXX.XXXX!XXXX!XXXX.XXXX', // scim_rp_client's client id.
    keyId: '000xx0x0-xx00-00xx-xx00-0x000x0x000x', // JWKS key id.
};

const scim2 = require('../lib/scim2')(config);
const chai = require('chai');
const expect = chai.expect;

describe('Check SCIM Configuration', () => {
    it('It should return SCIM Configuration', () => {
        scim2.getUsersCount()
            .then(() => {
                // Todo: need to mock every api call
            })
    })
});
