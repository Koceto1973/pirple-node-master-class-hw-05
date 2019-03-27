// data functions

// Global Dependencies
var fs = require('fs');
var path = require('path');

// Local Dependencies
var helpers = require('./helpers');
var config = require('./config.js');
var mongo = require('./mongo.js');

// Container for module (to be exported)
var data_fs = {};  // fs storage case
var data_mongo = mongo; // mongo db storage case

const storageType = config.storageType;
// Export the module corresponding to the actual storage type app runs currently
// set the correct storage
if (storageType == 'fs') {
  module.exports = data_fs;
} else {
  module.exports = data_mongo;
}

// Base directory of data folder
data_fs.baseDir = path.join(__dirname,'/.data/');

// Write data to a file
data_fs.create = function(dir,file,_data,callback){ // callback(false)
  // Open the file for writing
  fs.open(data_fs.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(_data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });

};

// Read data from a file
data_fs.read = function(dir,file,callback){ // callback(false,parsedData);
  fs.readFile(data_fs.baseDir+dir+'/'+file+'.json', 'utf8', function(err,_data){
    if(!err && _data){
      var parsedData = helpers.parseJsonToObject(_data);
      callback(false,parsedData);
    } else {
      callback(err,_data);
    }
  });
};

// Update data in a file
data_fs.update = function(dir,file,_data,callback){ // callback(false);

  // Open the file for writing
  fs.open(data_fs.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(_data);

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
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });

};

// Delete a file
data_fs.delete = function(dir,file,callback){

  // Unlink the file from the filesystem
  fs.unlink(data_fs.baseDir+dir+'/'+file+'.json', function(err){
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
      callback(false,trimmedFileNames);
    } else {
      callback(err,_data);
    }
  });
};
