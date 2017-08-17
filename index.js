module.exports = function (config) {
  var scim = require('./lib/scim');
  var scim2 = require('./lib/scim2');
  return {
    scim: scim(config),
    scim2: scim2(config)
  };
};
