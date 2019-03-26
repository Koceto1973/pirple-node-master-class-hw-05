// Mongo DB specific interface

// Global Dependencies
const MongoClient = require('mongodb').MongoClient;
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
  // dbUrl = `mongodb://${user}:${password}@${mongoDbServer}/?authMechanism=${authMechanism}`; // option for running local server with remote db
  dbUrl = "mongodb://localhost:27017";
}

// Create a new MongoClient
const client = new MongoClient(dbUrl, { useNewUrlParser: true });

const handlers = {};

handlers.create = function(collection, documentName, documentContent, callback){
  client.connect(function(err) {
    if(err) {
      debuglog("Failed to connect to MongoDB server.");
      callback("Failed to connect to MongoDB server.")
    } else {
      debuglog("Connected to MongoDB server.");
  
      // do your job with the db
      const document = JSON.parse(JSON.stringify(documentContent));
      document.documentName = documentName;

      // insert document
      insertDocument(client.db(mongoDbName),collection,document,function(err,data){
        // close connection finally
        client.close(function(error) {
          if(error) {
            debuglog("Failed to disconnect from MongoDB server.");
            callback("Failed to disconnect from MongoDB server.")
          } else {
            debuglog("Disconnected from MongoDB server.");

            if (err) {
              debuglog("Result after failure:");
              debuglog(JSON.stringify(data));
              callback(JSON.stringify(data));
            } else {
              debuglog("Result after succcess:");
              debuglog(JSON.stringify(data));
              callback(false);
            }
          }
        });
      });
    }
  });
}

handlers.read = function(){

}

handlers.update = function(){
  
}

handlers.delete = function(){
  
}

handlers.list = function(){
  
}

const insertDocument = function(db, collection, document, callback) {
  // Get the documents collection
  const collectione = db.collection(collection);

  // Insert document
  collectione.insertOne(document, function(err, result) {
    if (!err) {
      debuglog("Successfully inserted document in db.");
      callback(false,result);
    } else {
      debuglog("Failed to insert document in db:", err);
      callback(true, err);
    }
  });
}

module.exports = handlers;
