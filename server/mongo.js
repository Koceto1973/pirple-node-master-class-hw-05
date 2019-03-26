// Mongo DB specific interface

// Global Dependencies
const MongoClient = require('mongodb').MongoClient;

// Local Dependencies
var config = require('./config.js');

// Connection URL
var dbUrl ='';

const user = encodeURIComponent(config.mongoUser);
const password = encodeURIComponent(config.mongoPassword);
const mongoDb = encodeURIComponent(config.mongoDb);
const authMechanism = 'DEFAULT';
  
if (config.envName == 'production') {
  dbUrl = `mongodb://${user}:${password}@${mongoDb}/?authMechanism=${authMechanism}`;
} else {
  // dbUrl = `mongodb://${user}:${password}@${mongoDb}/?authMechanism=${authMechanism}`; // option for running local server with remote db
  dbUrl = "mongodb://$localhost:27017";
}

// Create a new MongoClient
const client = new MongoClient(dbUrl, { useNewUrlParser: true});

const handlers = {};

handlers.create = function(){
  
}

handlers.read = function(){

}

handlers.update = function(){
  
}

handlers.delete = function(){
  
}

handlers.list = function(){
  
}

module.export = handlers;
