/*
 *Title: Routes
 *Description: Application Routees
 *Author: Ahmed
 */

// Dependencies
const {
  sampleHandler,
} = require("../handlers/routesHandlers/sample.routeHandler");
const { userHandler } = require("../handlers/routesHandlers/user.routeHandler");
const {
  tokenHandler,
} = require("../handlers/routesHandlers/token.routeHandler");

// Module scaffolding
const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
};

module.exports = routes;
