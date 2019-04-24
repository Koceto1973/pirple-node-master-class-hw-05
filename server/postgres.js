// PostgreSQL DB specific interface

// Global Dependencies
const fs = require('fs');
const path = require('path');
const util = require('util');

const postgresql = require('pg');

// Local Dependencies
const config = require('./config.js');

const debuglog = util.debuglog('postgresql');

const user = encodeURIComponent(config.postgresUser);
const password = encodeURIComponent(config.postgresPassword);
const passwordLocal = encodeURIComponent(config.postgresPasswordLocal);
const server = config.postgresDbServer;
const port = config.postgresDbPort;
const db = encodeURIComponent(config.postgresDbName);

// return prepared query for execution from {name, text, values, rawMode} interpolating values at each $ in text
postgresql.format = (query) => {
  let text = [];
  text.push(query.text);
  query.values.forEach(value => {
    if (text[text.length-1][text[text.length-1].indexOf('$')+1] == '1') { // $1 brings "value"
      text.push( text[text.length-1].replace(/\$1/,`"${value}"`));
    } else { // $2 brings 'value'
      text.push( text[text.length-1].replace(/\$2/,`'${value}'`));
    }
  });

  return {
    name: query.name,
    text: text.pop(),
    values: [],
    rowMode: query.rowMode
  };
}

let connectionOptions = '';

// dbUrl resolve
if (config.envName == 'production') {
  connectionOptions = {
    host: server,
    port: port,
    user: user,
    password: password,
    database: db
  }
} else {
  // connectionOptions = {
  //   host: server,
  //   port: port,
  //   user: user,
  //   password: password,
  //   database: db
  // }
  connectionOptions = {
    host: '127.0.0.1',
    port:5432,
    user: 'postgres',
    password: passwordLocal,
    database: 'pizza-db'
  }
}

// Create a new db client
const client = new postgresql.Client(connectionOptions);

// Client connection at app start
client.connect(function(error) {
  if(error) {
    debuglog("Failed to connect to PostgreSQL server.");
  } else {
    debuglog("Connected to PostgreSQL server.");
  }
});

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){
  // check for duplicates before creation
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
  // Find some documents
  client.query(`select "content" from "${collection}" where "title"='${documentName}'`, function(error, result) {
    // process the query results
    if (error) {
      debuglog("Failed to query for reading in ", collection, " in db.");
      callback(true,error);
    } else if (result.rowCount == 0) {
      debuglog("Failed to read document in ", collection, " in db.");
      callback(true,"Failed to read document in " + collection + " in db.");
    } else {
      debuglog("Success to read document in ", collection, " in db.");

      let data = result.rows[0].content;
      callback(false, data);
    }
  });
}

handlers.update = function(collection, documentName, documentContentObject, callback){
  // Get the documents collection
  // const collectione = client.db(mongoDbName).collection(collection);
  // documentContentObject.documentName = documentName;
  // // Find some documents
  // collectione.findOneAndReplace({ "documentName" : { $eq : documentName } },documentContentObject,function(error, result) {
  //   // process the query results
  //   if (error) {
  //     debuglog("Failure to quiry for updating in ", collection, " in db.", error);
  //     callback("Failure to quiry for updating in " + collection + " in db.");
  //   } else if (!result || !result.lastErrorObject.updatedExisting) {
  //     debuglog("Failure to match document for updating in ", collection, " in db");
  //     callback("Failure to match document for updating in " + collection + " in db");
  //   } else {
  //     debuglog("Success to match and update document in ", collection, " in db.");
  //     callback(false);
  //   }
  // });
}

handlers.delete = function(collection, documentName, callback){
  // Get the documents collection
  // const collectione = client.db(mongoDbName).collection(collection);
  // // Find some documents
  // collectione.findOneAndDelete({ "documentName" : documentName },function(error, result) {
  //   // process the query results
  //   if (error) {
  //     debuglog("Failure to quiry for deletion in ", collection, " in db.", error);
  //     callback("Failure to quiry for deletion in " + collection + " in db.");
  //   } else if (!result || !result.lastErrorObject.n) {
  //     debuglog("Failure to match document for deletion in ", collection, " in db.");
  //     callback("Failure to match document deletion in " + collection + " in db.");
  //   } else {
  //     debuglog("Success to match document for deletion in ", collection, " in db.");
  //     callback(false);
  //   }
  // });
}

handlers.list = function(collection, callback){
  // Get the documents collection
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
  //     if (result && result.length !== 0) {
  //       array = result.map( element => element.documentName );
  //     }

  //     callback(false, array);
  //   }
  // });
}

// Client connection close on cli exit
handlers.close = function(callback){
  // Client closure
  client.end(function(error){
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
  
  client.query(`CREATE INDEX title_idx_${collection} ON "${collection}" ("title")`, function(error, data){
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
  if ( client._connected ){

    // load the menu db table
    client.query(`CREATE TABLE if not exists "menu"( "title" varchar(255), "content" JSON)`, (error,result)=>{
      if (error) {
        debuglog(`Error on creation table menu`, error);
      } else {
        debuglog(`Success on creation table menu`,result);
      }
    });
    
    // check if menu items are already loaded, load them if not
    client.query(`SELECT COUNT(*) FROM "menu"`, (error1,result1)=>{
      if (error1) {
        debuglog('Error querying menu table.');
      } else {
        if (result1 && result1.rows[0]['count'] == 0 ) { // menu table is empty
          let _path = path.join(__dirname, '/.data/menu/menu.json');
          let _menu = '';
          fs.readFile(_path,'utf-8', (error2, data2)=>{
            if (error2 || !data2) {
              debuglog('Error reading menu.json', error.message);
            } else {
              _menu = JSON.parse(data2);
              const unpreparedQuery = {
                name: 'queryName',  // prepared queries - connected client will parse it only once and remember it for optimization
                text: `INSERT INTO "menu"("title", "content") VALUES($2,$2)`,
                values: ["menu", JSON.stringify(_menu)],
              };
              client.query(postgresql.format(unpreparedQuery), (error3, result3) => {
                if (error3) {
                  debuglog('Menu is NOT loaded in the db.');
                } else {
                  debuglog('Menu is loaded in the db.');
                }
              });
            }
          });
        } else {
          debuglog('Menu is already loaded in the db.');
        }
      }

      // create basic collections/ tables users, tokens, orders
      client.query(`CREATE TABLE if not exists "users"("title" varchar(255), "content" JSON )`, (error1, result) => {
        if (!error1) {
          debuglog('Users table/collection is ready to use.');
          handlers.createIndexedCollection('users',()=>{});
          client.query(`CREATE TABLE if not exists "tokens"("title" varchar(255), "content" JSON )`, (error2, result) => {
            if (!error2) {
              debuglog('Tokens table/collection is ready to use.');
              handlers.createIndexedCollection('tokens',()=>{});
              client.query(`CREATE TABLE if not exists "orders"("title" varchar(255), "content" JSON )`, (error3, result) => {
                if (!error3) {
                  debuglog('Orders table/collection is ready to use.');
                  handlers.createIndexedCollection('orders',()=>{});
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

// handlers.create('test','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
 handlers.read('playground','two',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); })
// handlers.createIndexedCollection('test',(err,data)=>{ console.log(err); console.log(data); })
