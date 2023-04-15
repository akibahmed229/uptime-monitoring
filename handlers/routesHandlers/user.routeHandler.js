/*
 *Title: User Handler RESTful API (GET,POST,PUT,DELETE)
 *Description: Route handler to handle user related routes
 *Author: Ahmed
 */

// *Dependencies
const data = require("../../lib/data.lib");
const { hash } = require("../../helpers/utilites");
const { parseJSON } = require("../../helpers/utilites");
const tokenHandler = require("./token.routeHandler");

// *Module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

// *Module scaffolding
handler._users = {};

// *POST methods
handler._users.post = (requestProperties, callback) => {
  // checking the body field is valid
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean" &&
    requestProperties.body.tosAgreement
      ? requestProperties.body.tosAgreement
      : false;

  // if body fields exist with value
  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that user dosn't already exist
    data.read("users", phone, (err) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // Store the user to db
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(200, {
              messege: "User was created successfully",
            });
          } else {
            callback(500, {
              error: "could not create user!",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was a problem in server side",
        });
      }
    });
  } else {
    callback(400, {
      error: "you havn a problem in your request",
    });
  }
};

// *GET Method
handler._users.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  // If Phone number exists,
  if (phone) {
    // verify the token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // lookup the user
        data.read("users", phone, (err, userdata) => {
          const user = { ...parseJSON(userdata) };

          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: "Request user was not found",
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
    callback(404, {
      error: "Request user was not found",
    });
  }
};

// PUT method
handler._users.put = (requestProperties, callback) => {
  // checking the body field is valid
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  // If Phone number exists
  if (phone) {
    if (firstName || lastName || password) {
      // verify the token
      let token =
        typeof requestProperties.headersObject.token === "string"
          ? requestProperties.headersObject.token
          : false;

      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          //lookup the user
          data.read("users", phone, (err, udata) => {
            const userData = { ...parseJSON(udata) };

            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }
              // store to database
              data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200, {
                    messege: "User was successfully updated",
                  });
                } else {
                  callback(500, {
                    error: "There was a problem in the server side",
                  });
                }
              });
            } else {
              callback(400, {
                error: "You have a problem in your request",
              });
            }
          });
        } else {
          callback(400, {
            error: "You have a problem in your request",
          });
        }
      });
    } else {
      callback(400, {
        error: "Invalid phone number, please try again",
      });
    }
  }
};

// *DELETE method
handler._users.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  // If Phone number exists
  if (phone) {
    // verify the token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        //lookup the user
        data.read("users", phone, (err, userdata) => {
          if (!err && userdata) {
            data.delete("users", phone, (err) => {
              if (!err) {
                callback(200, {
                  error: "User was successfully deleted",
                });
              } else {
                callback(500, {
                  error: "There was a server side error",
                });
              }
            });
          } else {
            callback(500, {
              error: "There was a server side error",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failure",
        });
      }
    });
  } else
    callback(400, {
      error: "There was a problem  in your request",
    });
};

module.exports = handler;
