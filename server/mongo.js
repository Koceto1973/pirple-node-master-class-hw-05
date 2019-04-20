// Mongo DB specific interface

// Global Dependencies
const {MongoClient, ObjectId} = require('mongodb');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Local Dependencies
var config = require('./config.js');

const debuglog = util.debuglog('mongo');

// db connection URL
var dbUrl ='';

const user = encodeURIComponent(config.mongoUser);
const password = encodeURIComponent(config.mongoPassword);
const mongoDbServer = config.mongoDbServer;
const mongoDbName = encodeURIComponent(config.mongoDbName);
const authMechanism = 'DEFAULT';

// dbUrl resolve
if (config.envName == 'production') {
  dbUrl = `mongodb://${user}:${password}@${mongoDbServer}/${mongoDbName}?authMechanism=${authMechanism}`;
} else {
  // dbUrl = `mongodb://${user}:${password}@${mongoDbServer}/${mongoDbName}?authMechanism=${authMechanism}`; // option for running local server with remote db
  dbUrl = `mongodb://127.0.0.1:27017/${mongoDbName}`;
}

// Create a new MongoClient
const client = new MongoClient(dbUrl, { useNewUrlParser: true });

// Client connection at app start
client.connect(function(error) {
  if(error) {
    debuglog("Failed to connect to MongoDB server.");
  } else {
    debuglog("Connected to MongoDB server.");
  }
});

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){
  // check for duplicates before creation
  documentContentObject.documentName = documentName;
  const collectione = client.db(mongoDbName).collection(collection);
  collectione.find({"documentName":{$eq: documentName}}).toArray(function(error1, data1){
    if (error1){ // query error
      debuglog("Failure to query before document create in ", collection, " in db.");
      callback("Failure to query before document create in " + collection + " in db.");
    } else { // documentName exists in db
      if ( data1.length !== 0) {
        debuglog("Duplicate documentNames are not allowed in ", collection, " in db.");
        callback("Duplicate documentNames are not allowed in " + collection + " in db.");
      } else { // actual insert
        collectione.insertOne(documentContentObject, function(error2, data2){
          if (error2) {
            debuglog("Failed to create document in ", collection, " in db.");
            callback("Failed to create document in " + collection + " in db.");
          } else {
            debuglog("Success to create document in ", collection, " in db.");
            callback(false);
          }
        });
      }
    }
  });
}

handlers.read = function(collection, documentName, callback){
  // Get the documents collection
  const collectione = client.db(mongoDbName).collection(collection);
  // Find some documents
  collectione.find({ "documentName": documentName }).toArray(function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failed to query for reading in ", collection, " in db.");
      callback(true,error);
    } else if (result.length === 0) {
      debuglog("Failed to read document in ", collection, " in db.");
      callback(true,"Failed to read document in " + collection + " in db.");
    } else {
      debuglog("Success to read document in ", collection, " in db.");

      let data = result[0];
      delete data.documentName;
      delete data._id;
      
      callback(false,data);
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
      debuglog("Failure to quiry for updating in ", collection, " in db.", error);
      callback("Failure to quiry for updating in " + collection + " in db.");
    } else if (!result || !result.lastErrorObject.updatedExisting) {
      debuglog("Failure to match document for updating in ", collection, " in db");
      callback("Failure to match document for updating in " + collection + " in db");
    } else {
      debuglog("Success to match and update document in ", collection, " in db.");
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
      debuglog("Failure to quiry for deletion in ", collection, " in db.", error);
      callback("Failure to quiry for deletion in " + collection + " in db.");
    } else if (!result || !result.lastErrorObject.n) {
      debuglog("Failure to match document for deletion in ", collection, " in db.");
      callback("Failure to match document deletion in " + collection + " in db.");
    } else {
      debuglog("Success to match document for deletion in ", collection, " in db.");
      callback(false);
    }
  });
}

handlers.list = function(collection, callback){
  // Get the documents collection
  const collectione = client.db(mongoDbName).collection(collection);
  // Find some documents
  collectione.find({},{'documentName':1}).toArray(function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failure to quiry for listing in ", collection, " in db.", error);
      callback(true, "Failure to quiry for listing in " + collection + " in db.");
    } else {
      debuglog("Success to quiry for listing in ", collection, " in db.");

      let array = [];
      if (result.length !== 0) {
        array = result.map( element => element.documentName );
      }

      callback(false, array);
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

// Additional handlers for db set up
handlers.createIndexedCollection = function(collection, callback){
  const collectione = client.db(mongoDbName).collection(collection);
  collectione.createIndex({'documentName': 1}, function(error, data){
    if (error) {
      debuglog("Failed to index ", collection, " in db.");
      callback("Failed to index " + collection + " in db.");
    } else {
      debuglog("Success to index ", collection, " in db.");
      callback(false);
    }
  });
}

module.exports = handlers;

// waiting for the client to connect before loading the menu in the db an index basic collections
let timer = setInterval(() => {
  if ( client.isConnected() ){

    // read the menu
    let _path = path.join(__dirname, '/.data/menu/menu.json');
    let _menu = '';
    fs.readFile(_path,'utf-8', (error, data)=>{
      if (error || !data) {
        debuglog('Error reading menu.json', error.message);
      } else {
        _menu = JSON.parse(data);
        // load the menu
        handlers.create('menu','menu',_menu,(error)=>{
          if ( error) {
            debuglog('Menu is NOT loaded in the db.');
          } else {
            debuglog('Menu is loaded in the db.');
          }
        });
      }
    });

    // create and index the basic collections
    handlers.createIndexedCollection('users',(error)=>{debuglog(error)});
    handlers.createIndexedCollection('tokens',(error)=>{debuglog(error)});
    handlers.createIndexedCollection('orders',(error)=>{debuglog(error)});

    // stop timer
    clearInterval(timer);
  }
}, 1000*(1/10) );

// handlers.create('test','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('test','three',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); })
