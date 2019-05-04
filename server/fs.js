// file system specifiic interface

// Global Dependencies
const fs = require('fs');
const path = require('path');
const util = require('util');

const debuglog = util.debuglog('fs');

// Local Dependencies
const helpers = require('./helpers');

// container for the fs storage methods
const data_fs = {};

// Base directory of data folder
data_fs.baseDir = path.join(__dirname,'/.data/');

// Write data to a file
data_fs.create = function(dir,file,data,callback){ // callback(false)
  // Open the file for writing
  fs.open(data_fs.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              debuglog(`Success creating ${file} in ${dir}.`);
              callback(false);
            } else {
              debuglog(`Failure closing ${file} in ${dir}.`);
              callback('Error closing new file');
            }
          });
        } else {
          debuglog(`Failure writing ${file} in ${dir}.`);
          callback('Error writing to new file');
        }
      });
    } else {
      debuglog(`Failure creating ${file} in ${dir}, it may already exist.`);
      callback('Could not create new file, it may already exist');
    }
  });

};

// Read data from a file
data_fs.read = function(dir,file,callback){ // callback(false,parsedData);
  fs.readFile(data_fs.baseDir+dir+'/'+file+'.json', 'utf8', function(err,_data){
    if(!err && _data){
      var parsedData = helpers.parseJsonToObject(_data);
      debuglog(`Success reading ${file} from ${dir}.`);
      callback(false,parsedData);
    } else {
      debuglog(`Failure reading ${file} from ${dir}.`);
      callback(err,_data);
    }
  });
};

// Update data in a file
data_fs.update = function(dir,file,data,callback){ // callback(false);

  // Open the file for writing
  fs.open(data_fs.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.ftruncate(fileDescriptor,function(err){
        if(!err){
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData,function(err){
            if(!err){
              fs.close(fileDescriptor,function(err){
                if(!err){
                  callback(false);
                } else {
                  debuglog(`Failure closing existing ${file} in ${dir}.`);
                  callback('Error closing existing file');
                }
              });
            } else {
              debuglog(`Failure writing to existing ${file} in ${dir}.`);
              callback('Error writing to existing file');
            }
          });
        } else {
          debuglog(`Failure truncating ${file} in ${dir}.`);
          callback('Error truncating file');
        }
      });
    } else {
      debuglog(`Failure opening for update ${file} in ${dir}, it may not exist yet.`);
      callback('Could not open file for updating, it may not exist yet');
    }
  });
};

// Delete a file
data_fs.delete = function(dir,file,callback){

  // Unlink the file from the filesystem
  fs.unlink(data_fs.baseDir+dir+'/'+file+'.json', function(err){
    debuglog(`Success to delete ${file} from ${dir}.`);
    callback(err);
  });

};

// List all the items in a directory
data_fs.list = function(dir,callback){
  fs.readdir(data_fs.baseDir+dir+'/', function(err,_data){
    if(!err && _data && _data.length > 0){
      var trimmedFileNames = [];
      _data.forEach(function(fileName){
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      debuglog(`Success listing ${dir}.`);
      callback(false,trimmedFileNames);
    } else {
      debuglog(`Failure listing ${dir}.`);
      callback(err,_data);
    }
  });
};

module.exports = data_fs;
