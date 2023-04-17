/*
 *Title: Project Initial file
 *Description: Initial file to start the node server and workers
 *Author: Ahmed
 */

// *Dependencies
const server = require("./lib/server");
const workers = require("./lib/worker");

// *app object - module scaffolding
const app = {};

// *Init function
app.init = () => {
  // start the server
  server.init();
  // start the workers
  workers.init();
};

app.init();

// export the app
