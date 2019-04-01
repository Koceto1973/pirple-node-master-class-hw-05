// Mongo DB specific interface

// Global Dependencies
const {MongoClient, ObjectId} = require('mongodb');
const util = require('util');

// Local Dependencies
var config = require('./config.js');

const debuglog = util.debuglog('mongo');

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
let clientConnectionFlag = false;

// Client connection
client.connect(function(error) {
  if(error) {
    debuglog("Failed to connect to MongoDB server.");
  } else {
    debuglog("Connected to MongoDB server.");
    clientConnectionFlag = true;
  }
});

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){
  // check for duplicates before creation
  documentContentObject.documentName = documentName;
  const collectione = client.db(mongoDbName).collection(collection);
  collectione.find({"documentName":{$eq: documentName}}).toArray(function(error1, data1){
    if (error1){ // query error
      debuglog("Failure to query db.");
      callback("Failure to query db.");
    } else { // documentName exists in db
      if ( data1.length !== 0) {
        debuglog("Duplicate documentNames are not allowed in db.");
        callback("Duplicate documentNames are not allowed in db.");
      } else { // actual insert
        collectione.insertOne(documentContentObject, function(error2, data2){
          if (error2) {
            debuglog("Failed to create document in db.");
            callback("Failed to create document in db.");
          } else {
            debuglog("Success to create document in db.");
            callback(false);
          }
        });
      }
    }
  });
}

handlers.read = function(collection, documentName, callback){
  // query db for the documentName
  const document = { "documentName": documentName };

  // Get the documents collection
  const collectione = client.db(mongoDbName).collection(collection);
  // Find some documents
  collectione.find(document).toArray(function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failed to query db.");
      callback(true,"Failed to query db.");
    } else if (result.length === 0) {
      debuglog("Failed to match document in db.");
      callback(true,"Failed to match document in db.");
    } else {
      debuglog("Success to match document in db.");
      callback(false,JSON.stringify(result));
    }
  });
}

handlers.update = function(collection, documentName, documentContentObject, callback){
  // Get the documents collection
  const collectione = client.db(mongoDbName).collection(collection);
  documentContentObject.documentName = documentName;
  // Find some documents
  collectione.findOneAndReplace({ "documentName" : { $eq : documentName } },documentContentObject,function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failure to quiry db.", error);
      callback("Failure to quiry db.");
    } else if (!result.lastErrorObject.updatedExisting) {
      debuglog("Failure to match document.");
      callback("Failure to match document.");
    } else {
      debuglog("Success to match and update document in db.");
      callback(false);
    }
  });
}

handlers.delete = function(collection, documentName, callback){
  // Get the documents collection
  const collectione = client.db(mongoDbName).collection(collection);
  // Find some documents
  collectione.findOneAndDelete({ "documentName" : documentName },function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failure to quiry db.", error);
      callback("Failure to quiry db.");
    } else if (!result.lastErrorObject.n) {
      debuglog("Failure to match document.");
      callback("Failure to match document.");
    } else {
      debuglog("Success to match and delete document in db.");
      callback(false);
    }
  });
}

handlers.list = function(collection, callback){
  client.connect(function(error1) {
    if(error1) {
      debuglog("Failed to connect to MongoDB server.");
      callback(true,"Failed to connect to MongoDB server.");
    } else {
      debuglog("Connected to MongoDB server.");
  
      // Get the documents collection
      const collectione = client.db(mongoDbName).collection(collection);
      // Find some documents
      collectione.find({},{'documentName':1}).toArray(function(error2, result2) {
        // close connection finally
        client.close(function(error3) {
          if(error3) {
            debuglog("Failure to disconnect from MongoDB server.", error3);
            callback(true, "Failure to disconnect from MongoDB server.");
          } else {
            debuglog("Disconnected from MongoDB server.");

            // process the query results
            if (error2) {
              debuglog("Failure to quiry db.", error2);
              callback(true, "Failure to quiry db.");
            } else {
              debuglog("Success to query and list collection documents in db.");

              let array = [];
              if (result2.length !== 0) {
                array = result2.map( element => element.documentName );
              }
              callback(false, array);
            }
          }
        });
      });
    }
  });
}

// Client connection close on cli exit
handlers.close = function(callback){
  // Client closure
  client.close(function(error){
    if (error){
      debuglog("Failed to disconnect from db.");
      callback(1);
    } else {
      debuglog("Success to disconnect from db.");
      callback(0);
    }
  });
}

module.exports = handlers;

///////////////////// TODO handlers testing!
setTimeout(()=>{
  // handlers.create('test','three',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
  // handlers.read('test','three',(err,data)=>{ console.log(err);  console.log(data); });
  // handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
  // handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
  // handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
  // handlers.delete('test','three',(err)=>{console.log(err)});
  // handlers.list('test',(err,data)=>{ console.log(err); console.log(data); })
},1000*2);