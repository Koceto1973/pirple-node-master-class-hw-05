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

// handlers.create = function(collection, documentName, documentContent, callback){
//   client.connect(function(error1) {
//     if(error1) {
//       debuglog("Failed to connect to MongoDB server.");
//       callback("Failed to connect to MongoDB server.")
//     } else {
//       debuglog("Connected to MongoDB server.");
  
//       // checking if that document already exists
//       handlers.read(collection,documentName,function(error2,result){
//         if (!error2 || ()) {
//           callback('Creation of duplicate documentNames is not allowed!');
//         } else {
//           // no duplication
//           const document = JSON.parse(JSON.stringify(documentContent));
//           document.documentName = documentName;

//           // insert document
//           insertDocument(client.db(mongoDbName),collection,document,function(err,data){
//             // close connection finally
//             client.close(function(error) {
//               if(error) {
//                 debuglog("Failed to disconnect from MongoDB server.");
//                 callback("Failed to disconnect from MongoDB server.")
//               } else {
//                 debuglog("Disconnected from MongoDB server.");

//                 if (err) {
//                   debuglog("Result after failure:");
//                   debuglog(JSON.stringify(data));
//                   callback(JSON.stringify(data));
//                 } else {
//                   debuglog("Result after succcess:");
//                   debuglog(JSON.stringify(data));
//                   callback(false);
//                 }
//               }
//             });
//           });
//         }
//       })
//     }
//   });
// }

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
      callback(false,JSON.stringify(result));
    } else {
      debuglog("Failed to insert document in db:", err);
      callback(true, JSON.stringify(err));
    }
  });
}

module.exports = handlers;


// handlers.create('test','two',{"a":1,"b":2,"c":3},(data)=>{console.log(data)});
// handlers.read('test','three',(err,data)=>{ console.log(err);  console.log(data);})