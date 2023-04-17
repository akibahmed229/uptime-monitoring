/*
 *Title: CRUD
 *Description: CRUD operation in operating file system
 *Author: Ahmed
 */

// Dependencies
const fs = require("fs");
const path = require("path");

// Modeules scaffolding
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to file
lib.create = (dir, file, data, callback) => {
  // open file for writing

  fs.open(`${lib.baseDir + dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);

      // Write data to file and then close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback("Error closing the new file!!");
            }
          });
        } else {
          callback("Error writing to new File!!");
        }
      });
    } else {
      callback("could not create file , it already exists!!");
    }
  });
};

// Read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir + dir}/${file}.json`, "utf-8", (err, data) => {
    callback(err, data);
  });
};

// Update existing file
lib.update = (dir, file, data, callback) => {
  // File open for writing
  fs.open(`${lib.baseDir + dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // convert the data to string
      const stringData = JSON.stringify(data);

      // truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // write to the file and close it
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              //close the file
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback(`Error closing file`);
                }
              });
            } else {
              callback(`Error writing to file`);
            }
          });
        } else {
          callback(`Error truncateing file`, err);
        }
      });
    } else {
      callback(`Error updating file may not exist!!`);
    }
  });
};

// Delete Existing File
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(`Error deleting file`);
    }
  });
};

// *List all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir + dir}/`, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      let trimmedFileNames = [];

      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });
      callback(false, trimmedFileNames);
    } else {
      callback("Error reading directory");
    }
  });
};

module.exports = lib;
