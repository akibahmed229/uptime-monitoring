/*
 *Title: Utilities
 *Description: Important utilities function
 *Author: Ahmed
 */

// Dependencies
const crypto = require("crypto");
const environments = require("./environments");

// Module Scaffolding
const utilities = {};

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch (error) {
    output = {};
  }

  return output;
};

// Hash string
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    let hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  }
  return false;
};

// Create random string
utilities.createRandomString = (strLength) => {
  let length = strLength;
  length = typeof strLength === "number" && strLength > 0 ? strLength : false;

  if (length) {
    let possibleCharecters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";

    for (let i = 1; i <= length; i++) {
      let randomCharecter = possibleCharecters.charAt(
        Math.floor(Math.random() * possibleCharecters.length)
      );

      output += randomCharecter;
    }

    return output;
  } else {
    return false;
  }
};

// Export environments module
module.exports = utilities;
