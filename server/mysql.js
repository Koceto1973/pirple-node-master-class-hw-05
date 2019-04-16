// MySQL specific interface

// Global Dependencies
const fs = require('fs');
const util = require('util');
const debuglog = util.debuglog('mysql');

const mysql = require('mysql');

// Local Dependencies
const config = require('./config.js');

// db connection URL
let dbUrl ='';

const user = encodeURIComponent(config.mysqlUser);
const password = encodeURIComponent(config.mysqlPassword);
const passwordLocal = encodeURIComponent(config.mysqlPasswordLocal);
const mysqlDbServer = config.mysqlDbServer;
const mysqlDbPort = config.mysqlDbPort;
const mysqlDbName = encodeURIComponent(config.mysqlDbName);

let connectionOptions = '';

// dbUrl resolve
if (config.envName == 'production') {
  connectionOptions = {
    host: mysqlDbServer,
    port: mysqlDbPort,
    user: user,
    password: password,
    database: mysqlDbName
  }
} else {
  // connectionOptions = { // option for running local app with remote db
  //   host: mysqlDbServer,
  //   port: mysqlDbPort,
  //   user: user,
  //   password: password,
  //   database: mysqlDbName
  // }
  connectionOptions = {
    host: '127.0.0.1',
    port:3307,
    user: 'root',
    password: passwordLocal,
    database: 'pizza-db'
  }
}

// hooking to db server
const client = (connectionOptions, dbName = undefined) => {
  if (dbName){
    connectionOptions.database = dbName;
  }
  debuglog('*** created client connected to db server');
  return mysql.createConnection(connectionOptions);
}

// db client instance
const dbClient = client(connectionOptions);

// explicit db connection of the db server hook
const connect = (client) => client.connect(function(err) {
  try {
    if (err) throw err;
    // connection established
    debuglog('*** client db connected');
  } catch (error) {
    debuglog('*** client db error on connection:', error.sqlMessage);
  }
});

// db client instance connection
connect(dbClient);

// single db query with formated result and callback
const dbSingleQuery = (query, callback) => {
  dbClient.query(query, function (err, ...others) {
    debuglog("*** db query summary:", query);
    try {
      if (err) throw err;
      debuglog('SUCCEEDED');
      Array.prototype.forEach.call(others,curr=>{
        if (curr) debuglog(curr);
      });
      if (callback) { callback(); }
    } catch (error) {
      debuglog("FAILED", error.sqlMessage);
    }
  })
};

// closing db connection of the db server hook
const disconnect = (callback, client = dbClient) => client.end((err)=>{
  try {
    if (err) throw err;
    // connection established
    debuglog('*** client db disconnected');
    callback(0);
  } catch (error) {
    debuglog('*** client db error on disconnection:', error.sqlMessage);
    callback(1);
  }
});

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){
  // // check for duplicates before creation
  // documentContentObject.documentName = documentName;
  // const collectione = client.db(mongoDbName).collection(collection);
  // collectione.find({"documentName":{$eq: documentName}}).toArray(function(error1, data1){
  //   if (error1){ // query error
  //     debuglog("Failure to query before document create in ", collection, " in db.");
  //     callback("Failure to query before document create in " + collection + " in db.");
  //   } else { // documentName exists in db
  //     if ( data1.length !== 0) {
  //       debuglog("Duplicate documentNames are not allowed in ", collection, " in db.");
  //       callback("Duplicate documentNames are not allowed in " + collection + " in db.");
  //     } else { // actual insert
  //       collectione.insertOne(documentContentObject, function(error2, data2){
  //         if (error2) {
  //           debuglog("Failed to create document in ", collection, " in db.");
  //           callback("Failed to create document in " + collection + " in db.");
  //         } else {
  //           debuglog("Success to create document in ", collection, " in db.");
  //           callback(false);
  //         }
  //       });
  //     }
  //   }
  // });
}

handlers.read = function(collection, documentName, callback){
  dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error, result) => {
    if ( !error && result ) {
      debuglog(`Success to obtain results from quering table ${collection}.`);
      callback(false,JSON.parse(result[0].content));
    } else {
      debuglog(`Failed to obtain results from quering table ${collection}.`);
      callback(true, {'Note':error.message});
    }
  })
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
handlers.close = disconnect;

// Additional handlers for db set up
handlers.createIndexedCollection = function(collection, callback){
  // const collectione = client.db(mongoDbName).collection(collection);
  // collectione.createIndex({'documentName': 1}, function(error, data){
  //   if (error) {
  //     debuglog("Failed to index ", collection, " in db.");
  //     callback("Failed to index " + collection + " in db.");
  //   } else {
  //     debuglog("Success to index ", collection, " in db.");
  //     callback(false);
  //   }
  // });
}

module.exports = handlers;

// waiting for the client to connect before loading the db tables
let timer = setInterval(() => {
  if ( dbClient.state === 'authenticated' ){
    // load the menu db table
    dbSingleQuery(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`menu\`(title varchar(4), content JSON)`);
    
    // check if menu items are already loaded, load them if not
    dbClient.query(`SELECT COUNT(*) FROM \`${connectionOptions.database}\`.\`menu\``, (error,result)=>{
      if (error) {
        debuglog('Error querying menu table.');
      } else {
        if (result[0]['COUNT(*)'] === 0 ) { // menu table is empty
          let path = require('path').join(__dirname, '/.data/menu/menu.json');
          let _menu = '';
          fs.readFile(path,'utf-8', (error, data)=>{
            if (error || !data) {
              debuglog('Error reading menu.json', error.message);
            } else {
              _menu = JSON.parse(data);
              dbSingleQuery(mysql.format(`INSERT INTO \`${connectionOptions.database}\`.\`menu\`(title, content) VALUES("menu",?)`, JSON.stringify(_menu)), () => {
                debuglog('Menu is loaded in the db.');
              });
            }
          });
        } else {
          debuglog('Menu is already loaded in the db.');
        }
      }

      // create basic collections/ tables users, tokens, orders
      dbSingleQuery(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`users\`(title varchar(255), \`content\` JSON)`, (error, result) => {
        if (!error) {
          debuglog('Users table/collection is ready to use.');
          dbSingleQuery(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`tokens\`(title varchar(255), \`content\` JSON)`, (error, result) => {
            if (!error) {
              debuglog('Tokens table/collection is ready to use.');
              dbSingleQuery(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`orders\`(title varchar(255), \`content\` JSON)`, (error, result) => {
                if (!error) {
                  debuglog('Orders table/collection is ready to use.');
                  handlers.read('menu','menu',(err,data)=>{ console.log(err);  console.log(data); });
                } else {
                  debuglog('Basic tables/collections might NOT be ready to use.');
                }
              });
            } else {
              debuglog('Basic tables/collections might NOT be ready to use.');
            }
          });
        } else {
          debuglog('Basic tables/collections might NOT be ready to use.');
        }
      });

    });
    
  // stop timer
  clearInterval(timer);
  }
}, 1000*(1/10) );

// handlers.create('test','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('menu','menu',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); });

//  testing queries
  //  dbSingleQuery('CREATE DATABASE `pizza-db`');
  //  dbSingleQuery('CREATE TABLE `pizza-db`.`menu`(id int primary key auto_increment,title varchar(255) not null,completed tinyint(1) not null default 0)');
  //  dbSingleQuery('INSERT INTO `pizza-db`.`menu` (title, price) VALUES ("first pizza", 12.95)');
  //  dbSingleQuery('INSERT INTO `pizza-db`.`menu` (id, order) VALUES (orderId, JSON.stringify(order))');
  //  dbSingleQuery(mysql.format('INSERT INTO `pizza-db`.`menu`(title, price) VALUES(?,?)',[var1, var2]) );
  //  dbSingleQuery('DELETE FROM `pizza-db`.`menu` WHERE ("id" = "1")');
  //  dbSingleQuery('DROP TABLE `pizza-db`.`menu`');
  //  dbSingleQuery('DROP DATABASE `pizza-db`');