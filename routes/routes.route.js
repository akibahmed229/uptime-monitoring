/*
 *Title: Routes
 *Description: Application Routees
 *Author: Ahmed
 */

// *Dependencies
const {
  sampleHandler,
} = require("../handlers/routesHandlers/sample.routeHandler");
const { userHandler } = require("../handlers/routesHandlers/user.routeHandler");
const {
  tokenHandler,
} = require("../handlers/routesHandlers/token.routeHandler");
const {
  checkHandler,
} = require("../handlers/routesHandlers/check.routeHandler");

// *Module scaffolding
const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
