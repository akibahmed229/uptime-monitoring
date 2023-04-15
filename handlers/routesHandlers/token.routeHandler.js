/*
 *Title: Token Handler
 *Description: handler to handle token related routes
 *Author: Ahmed
 */

// *Dependencies
const data = require("../../lib/data.lib");
const { hash } = require("../../helpers/utilites");
const { parseJSON } = require("../../helpers/utilites");
const { createRandomString } = require("../../helpers/utilites");

// *Module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

// *Module scaffolding
handler._token = {};

// *POST methods
handler._token.post = (requestProperties, callback) => {
  // validitinf the body field
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

  // if phone and password exist
  if (phone && password) {
    // lookup the users
    data.read("users", phone, (err, userData) => {
      let hashedPassword = hash(password);

      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        // store the token
        data.create("tokens", tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, { tokenObject });
          } else {
            callback(500, {
              error: "There was a problem in the server side",
            });
          }
        });
      } else {
        callback(400, {
          error: "Password is not valid",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

// *GET Method
handler._token.get = (requestProperties, callback) => {
  // check the id if its valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  // If Phone number exists,
  if (id) {
    // lookup the token
    data.read("tokens", id, (err, tokendata) => {
      const token = { ...parseJSON(tokendata) };

      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Request token was not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Request token was not found",
    });
  }
};

// *PUT method
handler._token.put = (requestProperties, callback) => {
  // check the id if its valid
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  // check the extend field
  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;

  // if id and extend exist
  if (id && extend) {
    data.read("tokens", id, (err, tokendata) => {
      let tokenObject = { ...parseJSON(tokendata) };

      if (!err && tokenObject) {
        // check if the token has already expired
        if (tokenObject.expires > Date.now()) {
          // set the expiration an hour from now
          tokenObject.expires = Date.now() + 60 * 60 * 1000;

          // store the new updates token
          data.update("tokens", id, tokenObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                error: "There was a server side error",
              });
            }
          });
        } else {
          callback(400, {
            error: "The token has already expired",
          });
        }
      } else {
        callback(500, {
          error: "There was a server side error",
        });
      }
    });
  }
};

// *DELETE method
handler._token.delete = (requestProperties, callback) => {
  // check the id if its valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the token
    data.read("tokens", id, (err, tokendata) => {
      if (!err && tokendata) {
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, {
              message: "Token deleted successfully",
            });
          } else {
            callback(500, {
              error: "There was a server side error",
            });
          }
        });
      } else {
        callback(400, {
          error: "Request token was not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Request token was not found",
    });
  }
};

// Verify token General function
handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
