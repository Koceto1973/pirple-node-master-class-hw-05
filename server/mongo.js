// Mongo DB specific interface

// Global Dependencies
const {MongoClient, ObjectId} = require('mongodb');
const util = require('util');

// Local Dependencies
var config = require('./config.js');

const debuglog = util.debuglog('debug');

// db connection URL
var dbUrl ='';

const user = encodeURIComponent(config.mongoUser);
const password = encodeURIComponent(config.mongoPassword);
const mongoDbServer = encodeURIComponent(config.mongoDbServer);
const mongoDbName = encodeURIComponent(config.mongoDbName);
const authMechanism = 'DEFAULT';

// dbUrl resolve
if (config.envName == 'production') {
  dbUrl = `mongodb://${user}:${password}@${mongoDb}/?authMechanism=${authMechanism}`;
} else {
  // dbUrl = `mongodb://${user}:${password}@${mongoDbServer}?authMechanism=${authMechanism}`; // option for running local server with remote db
  dbUrl = "mongodb://127.0.0.1:27017";
}

// Create a new MongoClient
const client = new MongoClient(dbUrl, { useNewUrlParser: true });

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){
  client.connect(function(error1) {
    if(error1) {
      debuglog("Failed to connect to MongoDB server.");
      callback("Failed to connect to MongoDB server.");
    } else {
      debuglog("Connected to MongoDB server.");

      // check for duplicates before creation
      const filter = { "documentName": documentName };
      documentContentObject.documentName = documentName;
      const collectione = client.db(mongoDbName).collection(collection);
      collectione.find({"documentName":{$eq: documentName}}).toArray(function(error2, data2){
        if (error2){ // query error
          debuglog("Failure to query db.");
          client.close(function(error3){
            if (error3){
              debuglog("Failed to disconnect from db.");
            } else {
              debuglog("Success to disconnect from db.");
            }
            callback("Failure to query db.");
          });
        } else { // documentName exists in db
          if ( data2.length !== 0) {
            debuglog("Duplicate documentNames are not allowed in db.");
          client.close(function(error3){
            if (error3){
              debuglog("Failed to disconnect from db.");
            } else {
              debuglog("Success to disconnect from db.");
            }
            callback("Duplicate documentNames are not allowed in db.");
          });
          } else { // actual insert
            collectione.insertOne(documentContentObject, function(error4, data4){
              client.close(function(error5){
                if (error5) {
                  debuglog("Failed to disconnect from MongoDB server.");
                  callback("Failed to disconnect from MongoDB server.");
                } else {
                  debuglog("Success to disconnect from MongoDB server.");
  
                  if (error4) {
                    debuglog("Failed to create document in db.");
                    callback("Failed to create document in db.");
                  } else {
                    debuglog("Success to create document in db.");
                    callback(false);
                  }
                }
              });
            });
          }
        }
      });
    }
  });
}

handlers.read = function(collection, documentName, callback){
  client.connect(function(error1) {
    if(error1) {
      debuglog("Failed to connect to MongoDB server.");
      callback(true,"Failed to connect to MongoDB server.");
    } else {
      debuglog("Connected to MongoDB server.");
  
      // query db for the documentName
      const document = { "documentName": documentName };

      // Get the documents collection
      const collectione = client.db(mongoDbName).collection(collection);
      // Find some documents
      collectione.find(document).toArray(function(error2, result) {
        // close connection finally
        client.close(function(error3) {
          if(error3) {
            debuglog("Failed to disconnect from MongoDB server.");
            callback(true,"Failed to disconnect from MongoDB server.");
          } else {
            debuglog("Disconnected from MongoDB server.");

            // process the query results
            if (error2) {
              debuglog("Failed to query db.");
              callback(true,"Failed to query db.");
            } else if (result.length === 0) {
              debuglog("Failed to match document in db.");
              callback(true,"Failed to match document in db.");
            } else {
              debuglog("Success to match document in db.");
              callback(false,JSON.stringify(result));
            }
          }
        });
      }); 
    }
  });
}

handlers.update = function(collection, documentName, documentContentObject, callback){
  client.connect(function(error1) {
    if(error1) {
      debuglog("Failed to connect to MongoDB server.");
      callback("Failed to connect to MongoDB server.");
    } else {
      debuglog("Connected to MongoDB server.");
  
      // Get the documents collection
      const collectione = client.db(mongoDbName).collection(collection);
      documentContentObject.documentName = documentName;
      // Find some documents
      collectione.findOneAndReplace({ "documentName" : { $eq : documentName } },documentContentObject,function(error2, result2) {
        // close connection finally
        client.close(function(error3) {
          if(error3) {
            debuglog("Failure to disconnect from MongoDB server.", error3);
            callback("Failure to disconnect from MongoDB server.");
          } else {
            debuglog("Disconnected from MongoDB server.");

            // process the query results
            if (error2) {
              debuglog("Failure to quiry db.", error2);
              callback("Failure to quiry db.");
            } else if (!result2.lastErrorObject.updatedExisting) { console.log(result2);
              debuglog("Failure to match document.");
              callback("Failure to match document.");
            } else { console.log(result2);
              debuglog("Success to match and update document in db.");
              callback(false);
            }
          }
        });
      });
    }
  });
}

handlers.delete = function(){
  
}

handlers.list = function(){  
}

module.exports = handlers;

// TODO handlers testing!
// handlers.create('test','three',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
 handlers.update('test','two',{'c':2},(err)=>{console.log(err)});