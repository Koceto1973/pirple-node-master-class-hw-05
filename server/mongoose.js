// Mongo DB specific interface

// Global Dependencies
const mongoose = require('mongoose');
const util = require('util');

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
const Menu = mongoose.model('Menu', universalSchema);

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
        result.push(queryElement.name);
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
  // const collectione = client.db(mongoDbName).collection(collection);
  // documentContentObject.documentName = documentName;
  // // Find some documents
  // collectione.findOneAndReplace({ "documentName" : { $eq : documentName } },documentContentObject,function(error, result) {
  //   // process the query results
  //   if (error) {
  //     debuglog("Failure to quiry for updating in ", collection, " in db.", error);
  //     callback("Failure to quiry for updating in " + collection + " in db.");
  //   } else if (!result.lastErrorObject.updatedExisting) {
  //     debuglog("Failure to match document for updating in ", collection, "in db");
  //     callback("Failure to match document for updating in " + collection + "in db");
  //   } else {
  //     debuglog("Success to match and update document in ", collection, " in db.");
  //     callback(false);
  //   }
  // });
}

handlers.delete = function(collection, documentName, callback){
  // // Get the documents collection
  // const collectione = client.db(mongoDbName).collection(collection);
  // // Find some documents
  // collectione.findOneAndDelete({ "documentName" : documentName },function(error, result) {
  //   // process the query results
  //   if (error) {
  //     debuglog("Failure to quiry for deletion in ", collection, " in db.", error);
  //     callback("Failure to quiry for deletion in " + collection + " in db.");
  //   } else if (!result.lastErrorObject.n) {
  //     debuglog("Failure to match document for deletion in ", collection, " in db.");
  //     callback("Failure to match document deletion in " + collection + " in db.");
  //   } else {
  //     debuglog("Success to match document for deletion in ", collection, " in db.");
  //     callback(false);
  //   }
  // });
}

handlers.list = function(collection, callback){
  // // Get the documents collection
  // const collectione = client.db(mongoDbName).collection(collection);
  // // Find some documents
  // collectione.find({},{'documentName':1}).toArray(function(error, result) {
  //   // process the query results
  //   if (error) {
  //     debuglog("Failure to quiry for listing in ", collection, " in db.", error);
  //     callback(true, "Failure to quiry for listing in " + collection + " in db.");
  //   } else {
  //     debuglog("Success to quiry for listing in ", collection, " in db.");

  //     let array = [];
  //     if (result.length !== 0) {
  //       array = result.map( element => element.documentName );
  //     }

  //     callback(false, array);
  //   }
  // });
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
  // if ( client.isConnected() ){
  //   // load the menu
  //   handlers.create('menu','menu',{
  //     "Margherita": 2.90,
  //     "Funghi": 3.60,
  //     "Capricciosa": 3.30,
  //     "Quattro Stagioni": 3.70,
  //     "Vegetariana": 2.80,
  //     "Marinara": 4.20,
  //     "Peperoni": 3.40,
  //     "Napolitana":3.50,
  //     "Hawaii": 3.20,
  //     "Maltija": 3.60,
  //     "Calzone": 4.20,
  //     "Rucola": 3.50,
  //     "Bolognese": 3.60,
  //     "Meat Feast": 4.30,
  //     "Kebabpizza": 4.00,
  //     "Mexicana": 3.90,
  //     "Quattro Formaggi": 4.20
  //   },()=>{
  //     debuglog('Menu is loaded in the db.');
  //   })
  //   // create and index the basic collections
  //   handlers.createIndexedCollection('users',(error)=>{debuglog(error)});
  //   handlers.createIndexedCollection('tokens',(error)=>{debuglog(error)});
  //   handlers.createIndexedCollection('orders',(error)=>{debuglog(error)});

  //   // stop timer
  //   clearInterval(timer);
  // }
}, 1000*(1/10) );

// handlers.create('users','three',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
 handlers.read('users','three',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); })
