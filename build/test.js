"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SCIM2_1 = __importDefault(require("./lib/SCIM2"));
const SCIMCommon_1 = require("./lib/SCIMCommon");
let client = new SCIM2_1.default({
    keyAlg: SCIMCommon_1.JWTAlgorithm.HS256,
    domain: "https://auth-pp.jvsonline.fr",
    clientId: "@!0071.B750.04BC.F7DE!0001!DA1D.AB8A!0008!F9EB.7965.8786.B61F",
    keyId: "@!0071.B750.04BC.F7DE!0001!DA1D.AB8A!0008!7FA5.400B",
    privateKey: "./build/oxid.key",
    scimTestMode: true,
    userPassword: process.env.TEST_PASSWORD
});
client.getUsers(0, 1).then(result => {
    debugger;
})
    .catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=test.js.map