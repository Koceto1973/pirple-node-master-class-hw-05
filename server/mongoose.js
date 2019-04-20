// Mongo DB specific interface

// Global Dependencies
const fs = require('fs');
const util = require('util');
const path = require('path');

const mongoose = require('mongoose');

// Local Dependencies
var config = require('./config.js');

const debuglog = util.debuglog('mongoose');

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

mongoose.Promise = global.Promise;

const connectionOptions = {
  autoIndex: true,
  useCreateIndex: true,
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  useNewUrlParser: true
}

mongoose.connect(dbUrl, connectionOptions, (error) => {
  if (error) {
    debuglog("Mongoose failure to initially connect to MongoDB server.");
  } else {
    debuglog("Mongoose success to initially connect to MongoDB server.");
  }
});

// indexed schema
const universalSchema = new mongoose.Schema({
  name: { type: String, index: true },
  content: Map
});

// models
const User = mongoose.model('User', universalSchema);
const Token = mongoose.model('Token', universalSchema);
const Order = mongoose.model('Order', universalSchema);
const Menu = mongoose.model('Menu', universalSchema, 'menu'); // do not make 'menus' collection

const handlers = {};

// route to User,Token,Order or Menu model
handlers.routeCollection = (collection) => {
  let collectione = '';
  
  switch (collection) {
    case 'users': collectione = User;
      break;
    case 'tokens': collectione = Token;
      break;
    case 'orders': collectione = Order;
      break;
    default: collectione = Menu;
  }

  return collectione;

}

handlers.create = function(collection, documentName, documentContentObject, callback){
  // Get the documents collection
  const collectione = handlers.routeCollection(collection);
  
  let document = new collectione({name:documentName, content:documentContentObject})

  collectione.countDocuments({name:{$eq: documentName}},(error1,count)=>{
    if (error1) {
      debuglog("Failure to query before document create in ", collection, " in db.");
      callback("Failure to query before document create in " + collection + " in db.");
    } else {
      if ( count != 0 ) {
        debuglog("Duplicate documentNames are not allowed in ", collection, " in db.");
        callback("Duplicate documentNames are not allowed in " + collection + " in db.");
      } else { // actual insert
        document.save(function(error2, data2){
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
  const collectione = handlers.routeCollection(collection);
  // Find some documents
  collectione.find({ name: documentName }, function(error, query) {
    // process the query results
    if (error) {
      debuglog("Failed to query for reading from ", collection, " in db.");
      callback(true,error);
    } else {
      let result = [];
      query.map(queryElement => {
        result.push(queryElement.content.toJSON());
      });

      if (result.length === 0) {
        debuglog("Failed to read document from ", collection, " in db.");
        callback(true,"Failed to read document from " + collection + " in db.");
      } else {
        debuglog("Success to read document from ", collection, " in db.");
        
        callback(false,result[0]);
      }
    }
  });
}

handlers.update = function(collection, documentName, documentContentObject, callback){
  // // Get the documents collection
  const collectione = handlers.routeCollection(collection);

  // Find some documents
  collectione.findOneAndUpdate({ name : { $eq : documentName } }, { content: documentContentObject }, { rawResult: true }, function(error, result) {
    console.log(result); 
    // process the query results
     if (error) {
       debuglog("Failure to quiry for updating in ", collection, " in db.", error);
       callback("Failure to quiry for updating in " + collection + " in db.");
     } else if (!result || !result.lastErrorObject.updatedExisting) {
       debuglog("Failure to match document for updating in ", collection, " in db");
       callback("Failure to match document for updating in " + collection + "in db");
     } else {
       debuglog("Success to match and update document in ", collection, " in db.");
       callback(false);
     }
  });
}

handlers.delete = function(collection, documentName, callback){
  // Get the documents collection
  const collectione = handlers.routeCollection(collection);

  // Find some documents
  collectione.findOneAndDelete({ name : documentName }, { rawResult: true }, function(error, result) {
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
  const collectione = handlers.routeCollection(collection);

  // Find some documents
  collectione.find({},{name:1}, function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failure to quiry for listing in ", collection, " in db.", error);
      callback(true, "Failure to quiry for listing in " + collection + " in db.");
    } else {
      debuglog("Success to quiry for listing in ", collection, " in db.");

      let array = [];
      if (result && result.length !== 0) {
        array = result.map( element => element.name );
      }

      callback(false, array);
    }
  });
}

// Client connection close on cli exit
handlers.close = function(callback){
  // Connection closure
  mongoose.connection.close(function(error){
    if (error){
      debuglog("Failed to disconnect mongoose from db.");
      callback(1);
    } else {
      debuglog("Success to disconnect mongoose from db.");
      callback(0);
    }
  });
}

module.exports = handlers;

// waiting for the client to connect before loading the menu in the db an index basic collections
let timer = setInterval(() => {
  if ( mongoose.connection.readyState === 1 ) {
  
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
  
    // stop timer
    clearInterval(timer);
  }
}, 1000*(1/10) );

// handlers.create('users','two',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('users','three',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('users','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('users','four',{'c':2},(err)=>{console.log(err)});
// handlers.update('users','three',{'c':2},(err)=>{console.log(err)});
//  handlers.delete('users','two',(err)=>{console.log(err)});
// handlers.list('users',(err,data)=>{ console.log(err); console.log(data); })
