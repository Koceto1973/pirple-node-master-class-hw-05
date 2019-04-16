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
  // check for duplicates before creation
  dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error1, result1) => {
    if (error1){ // query error
      debuglog(`Failed to read row from table ${collection}.`, error1);
      callback(`Failed to read row from table ${collection}.`);
    } else { // documentName exists in db
      if ( result1.length !== 0) {
        debuglog(`Duplicates in title column are not allowed in table ${collection}.`);
        callback(`Duplicates in title column are not allowed in table ${collection}.`);
      } else { // actual insert
        const insertion = JSON.stringify(documentContentObject);
        dbClient.query(`INSERT INTO \`${connectionOptions.database}\`.\`${collection}\` (title, content) VALUES ('${documentName}', '${insertion}')`, (error2, result2) => {
          if (error2) {
            debuglog(`Failed to add row in table ${collection}.`, error2);
            callback(`Failed to add row in table ${collection}.`);
          } else {
            debuglog(`Success to add row in table ${collection}.`);
            callback(false);
          }
        });
      }
    }
  });
}

handlers.read = function(collection, documentName, callback){
  dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error, result) => {
    if ( !error && result ) {
      debuglog(`Success to obtain results from quering table ${collection}.`);
      callback(false,JSON.parse(result[0].content));
    } else {
      debuglog(`Failed to obtain results from quering table ${collection}.`, error);
      callback(true, {'Note':error.message});
    }
  })
}

handlers.update = function(collection, documentName, documentContentObject, callback){
  const updated = JSON.stringify(documentContentObject);
  // Find some documents
  dbClient.query(`UPDATE \`${connectionOptions.database}\`.\`${collection}\` SET \`content\`='${updated}' WHERE \`title\`='${documentName}'`, (error, result) => {
    // process the query results
    if (error) {
      debuglog(`Failed to update row in table ${collection}.`, error);
      callback(`Failed to add row in table ${collection}.`);
    } else if (result.changedRows === 0) {
      debuglog(`Failed to update row in table ${collection}.`);
      callback(`Failed to update row in table ${collection}.`);
    } else {
      debuglog(`Success to update row in table ${collection}.`);
      callback(false);
    }
  });
}

handlers.delete = function(collection, documentName, callback){
  // Find some documents
  dbClient.query(`DELETE FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`,function(error, result) {
    // process the query results
    if (error) {
      debuglog(`Failed to delete row from table ${collection}.`, error);
      callback(`Failed to delete row from table ${collection}.`);
    } else if (result.changedRows === 0) {
      debuglog(`Failed to delete row from table ${collection}.`);
      callback(`Failed to delete row from table ${collection}.`);
    } else {
      debuglog(`Success to delete row from table ${collection}.`);
      callback(false);
    }
  });
}

handlers.list = function(collection, callback){
  // Find some documents
  dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\``, (error, result) => {
    // process the query results
    if (error) {
      debuglog(`Failed to quiry for listing table ${collection}.`, error);
      callback(true, `Failed to quiry for listing table ${collection}.`);
    } else {
      debuglog(`Success to quiry for listing table ${collection}.`);
      
      let array = [];
      if (result.length !== 0) {
        array = result.map( element => element.title );
      }

      callback(false, array);
    }
  });
}

// Client connection close on cli exit
handlers.close = disconnect;

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
                  // queries for manual testing may be placed here ...
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

// some testing handlers
// handlers.create('test','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('menu','menu',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); });
