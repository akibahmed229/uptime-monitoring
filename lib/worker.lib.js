/*
 *Title: Worker Libary
 *Description: Worker related file
 *Author: Ahmed
 */

// *Dependencies
const data = require("./data.lib");
const { parseJSON } = require("../helpers/utilites");
const url = require("url");
const http = require("http");
const https = require("https");
const { sendTwilioSms } = require("../helpers/notifications");

// *Worker object - module scaffolding
const worker = {};

// *Get all the checks
worker.getherAllChecks = () => {
  // get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the check data
        data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // pass the data to the check validator
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error reading one of the check's data");
          }
        });
      });
    } else {
      console.log("Error: Could not find any checks to process");
    }
  });
};

// *validate individual  check data
worker.validateCheckData = (originalCheckData) => {
  let originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    originalData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // pass to the next process
    worker.performCheck(originalData);
  } else {
    console.log("Error: check data was invalid or not properly formatted");
  }
};

// *Perform the check
worker.performCheck = (originalCheckData) => {
  // prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  // mark the outcome has not been sent yet
  let outcomeSent = false;

  // parse the hostname and full url  from original data
  const parseUrl = url.parse(
    originalCheckData.protocol + "://" + originalCheckData.url,
    true
  );
  const hostname = parseUrl.hostname;
  const path = parseUrl.path;

  // construct the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname,
    method: originalCheckData.method.toUpperCase(),
    path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    const status = res.statusCode;

    // update the check outcome and pass to the next process
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("timeout", () => {
    checkOutcome = {
      error: true,
      value: "timeout",
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // req semd
  req.end();
};

// *Process the check outcome and update the check data
worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // check if check outcome is up or down
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  // decide if an alert is warranted
  let alertWarranted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // update the check data
  let newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check data
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWarranted) {
        // send the alert to the user
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Check outcome has not changed, no alert needed");
      }
    } else {
      console.log("Error trying to save updates to one of the checks");
    }
  });
};

// *Send notification to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`user was alerted to a status change via SMS: ${msg}`);
    } else {
      console.log("There was a problem sending the SMS: " + err);
    }
  });
};

// *timer to execute the worker object once per minute
worker.loop = () => {
  setInterval(() => {
    worker.getherAllChecks();
  }, 1000 * 60);
};

// *Start the workers
worker.init = () => {
  // execute all the checks
  worker.getherAllChecks();

  // call the loop so the checks continue
  worker.loop();
};

// export
module.exports = worker;
