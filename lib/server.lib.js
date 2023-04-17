/*
 *Title: Server Libary
 *Description: Server related file
 *Author: Ahmed
 */

// *Dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const environment = require("../helpers/environments");

// *server object - module scaffolding
const server = {};

// *Create Server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () => {
    console.log(`listing to http://localhost:${environment.port}`);
  });
};

// *Handle Requests Response
server.handleReqRes = handleReqRes;

// *Start the server
server.init = () => {
  server.createServer();
};

// export
module.exports = server;
