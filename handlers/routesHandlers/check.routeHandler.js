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
handler._check.get = (requestProperties, callback) => {
  // check the id if its valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(500, {
                error: "Authentication error",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "Server side error",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem  in your request",
    });
  }
};

// *PUT method
handler._check.put = (requestProperties, callback) => {
  // check the id if its valid
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

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

  // if id exist
  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);

          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          // Verifying the toke
          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }

                // store the chekObject
                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, {
                      error: "Server Side Error",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentation error",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "Server side error",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least one field to update!",
      });
    }
  } else {
    callback(400, {
      error: "There was a problem  in your request",
    });
  }
};

// *DELETE method
handler._check.delete = (requestProperties, callback) => {
  // check the id if its valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  // if id exist
  if (id) {
    // lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // delete the check data
              data.delete("checks", id, (err) => {
                if (!err) {
                  data.read(
                    "users",
                    parseJSON(checkData).userPhone,
                    (err, userData) => {
                      let userObject = parseJSON(userData);
                      if (!err && userData) {
                        let userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        // remove the deleted check id from user list of checks
                        let checkPosition = userChecks.indexOf(id);

                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // resave the user data
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phone,
                            userObject,
                            (err) => {
                              if (!err) {
                                callback(200);
                              } else {
                                callback(500, {
                                  error: "Server side error",
                                });
                              }
                            }
                          );
                        } else {
                          callback(401, {
                            error:
                              "The check id that you are trying to remove is not found in user!",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "Server side error",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: "Server side error",
                  });
                }
              });
            } else {
              callback(401, {
                error: "Authentication error",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "Server side error",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem  in your request",
    });
  }
};

module.exports = handler;
