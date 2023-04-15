/*
 *Title: Environments
 *Description: Handle all environments related things
 *Author: Ahmed
 */

// *Dependencies

// *Module Scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "hiiamyourdad",
  maxChecks: 5,
};
environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "hiiamyourmom",
  maxChecks: 5,
};

// *Determine which environments was passed
const currentEnvironments =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

// *Check corresponding environments object
const environmentToExport =
  typeof environments[currentEnvironments] === "object"
    ? environments[currentEnvironments]
    : environments.staging;

// *Export environments module
module.exports = environmentToExport;
