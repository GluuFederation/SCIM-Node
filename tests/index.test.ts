import SCIM2 from "../src/lib/SCIM2";
import {JWTAlgorithm} from "../src/lib/SCIMCommon";


expect.extend({
  async toBeAGluuAnswer(received) {
    const pass = received && received.schemas && received.totalResults && received.startIndex && received.itemsPerPage && received.Resources;

    if (pass) {
      return {
        message: () =>
          `expected ${received} a valid gluu answer`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} is not a valid gluu answer`,
        pass: false,
      };
    }
  },
});

test('Test connection testMode', () => {
  let client = new SCIM2({
    keyAlg: JWTAlgorithm.HS256,
    domain: "https://auth-pp.jvsonline.fr",
    clientId: "@!0071.B750.04BC.F7DE!0001!DA1D.AB8A!0008!F9EB.7965.8786.B61F",
    keyId: "@!0071.B750.04BC.F7DE!0001!DA1D.AB8A!0008!7FA5.400B",
    privateKey: "./build/oxid.key",
    scimTestMode: true,
    userPassword: process.env.TEST_PASSWORD
  });

  expect(client.getUsers(0,1)).resolves().toBeAGluuAnswer()
});

test('add user - testMode', () => {
  let client = new SCIM2({
    keyAlg: JWTAlgorithm.HS256,
    domain: "https://auth-pp.jvsonline.fr",
    clientId: "@!0071.B750.04BC.F7DE!0001!DA1D.AB8A!0008!F9EB.7965.8786.B61F",
    keyId: "@!0071.B750.04BC.F7DE!0001!DA1D.AB8A!0008!7FA5.400B",
    privateKey: "./build/oxid.key",
    scimTestMode: true,
    userPassword: process.env.TEST_PASSWORD
  });

  expect(client.getUsers(0,1)).resolves().toBeAGluuAnswer()
});
