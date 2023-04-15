/*
 *Title: Uptime Monitoring Application
 *Description: A RESTful application to monitor up or down time  of user defined links
 *Author: Ahmed
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const environment = require("./helpers/environments");
const data = require("./lib/data.lib");

// app object - module scaffolding
const app = {};

// Testing file system
// @TODO:

// Create Server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`listing to http://localhost:${environment.port}`);
  });
};

// Handle Requests Response
app.handleReqRes = handleReqRes;

// Start the server
app.createServer();
