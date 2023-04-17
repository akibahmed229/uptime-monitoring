/*
 *Title: Notification libary
 *Description: Important function to notify users
 *Author: Ahmed
 */

// *Dependencies
const https = require("https");
const { twilio } = require("./environments");
const querystring = require("querystring");

// *Module scaffolding
const notification = {};

// *Send sms to users using twilio api
notification.sendTwilioSms = (phone, msg, callback) => {
  // input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    const requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // get the status of the sent request
      const status = res.statusCode;
      // callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback("status code returned was " + status);
      }
    });

    req.on("error", (e) => {
      callback(e);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callback("Given parameter weir missing or invalid!");
  }
};

// *Export The module
module.exports = notification;
