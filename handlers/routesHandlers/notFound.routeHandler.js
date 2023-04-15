/*
 *Title: Not Found handler
 *Description: 404 Not Found handler
 *Author: Ahmed
 */

// *Module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: "Your requested URL Not Found!",
  });
};

module.exports = handler;
