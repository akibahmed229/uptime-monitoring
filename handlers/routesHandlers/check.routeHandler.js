/*
 *Title: Check Handler
 *Description: Handler to handle user defined checks
 *Author: Ahmed
 */
// Dependencies
const data = require("../../lib/data.lib");
const { createRandomString } = require("../../helpers/utilites");
const { parseJSON } = require("../../helpers/utilites");
const tokenHandler = require("./token.routeHandler");
const { maxChecks } = require("../../helpers/environments");

// Module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

// *Module scaffolding
handler._check = {};

// *POST methods
handler._check.post = (requestProperties, callback) => {
  // validate input
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array &&
    requestProperties.body.successCodes.length > 0
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // lookup the user phone number by reading the token
    data.read("tokens", token, (err, tokenData) => {
      if (!err) {
        let userPhone = parseJSON(tokenData).phone;

        // lookup the user data
        data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  // save the object
                  data.create("checks", checkId, checkObject, (err) => {
                    if (!err) {
                      // add the check id to the user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user data
                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "There was a problem in server side",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "There was a problem in server side",
                      });
                    }
                  });
                }
              } else {
                callback(401, {
                  error: "User already reached max check limit!!",
                });
              }
            });
          } else {
            callback(403, {
              error: "User not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failure",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem  in your request",
    });
  }
};

// *GET Method
handler._check.get = (requestProperties, callback) => {};

// *PUT method
handler._check.put = (requestProperties, callback) => {};

// *DELETE method
handler._check.delete = (requestProperties, callback) => {};

module.exports = handler;
