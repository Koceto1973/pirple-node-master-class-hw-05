// MySQL specific interface

// Global Dependencies
const fs = require('fs');
const path = require('path');
const util = require('util');
const debuglog = util.debuglog('mysqlx');

const mysqlx = require('@mysql/xdevapi');

// Local Dependencies
const config = require('./config.js');

// connection object
let connectionObject = {};

const user = encodeURIComponent(config.mysqlUser);
const password = encodeURIComponent(config.mysqlPassword);
const passwordLocal = encodeURIComponent(config.mysqlPasswordLocal);
const mysqlDbServer = config.mysqlDbServer;
const mysqlDbPort = config.mysqlDbPort;
const mysqlDbName = encodeURIComponent(config.mysqlDbName);

// connectionObject resolve
if (config.envName == 'production') {
  connectionObject = {
    host: mysqlDbServer,
    port: mysqlDbPort,
    user: user,
    password: password,
    database: mysqlDbName
  }
} else {
  // connectionObject = { // option for running local app with remote db
  //   host: mysqlDbServer,
  //   port: mysqlDbPort,
  //   user: user,
  //   password: password,
  //   database: mysqlDbName
  // }
  connectionObject = {
    host: '127.0.0.1',
    port:33070,
    user: 'root',
    password: passwordLocal,
    database: 'pizza-db'
  }
}

let connectionOptions = { 
  pooling: { 
     enabled: true, 
     maxSize: 10 
    } 
};

// db client instance
const client = mysqlx.getClient(connectionObject, connectionOptions);

// client disconnection
const disconnect = (callback) => { 
  client.close().then(
    (value)=>{
      debuglog(`Success to close MySQL X Dev Api client.`);
      callback(0);
    },
    (error)=>{
      debuglog(`Failuere to close MySQL X Dev Api client.`);
      callback(1);
    }
  )
};

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){ 
  // // check for duplicates before creation
  // dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error1, result1) => {
  //   if (error1){ // query error
  //     debuglog(`Failed to read row from table ${collection}.`, error1);
  //     callback(`Failed to read row from table ${collection}.`);
  //   } else { // documentName exists in db
  //     if ( result1.length !== 0) {
  //       debuglog(`Duplicates in title column are not allowed in table ${collection}.`);
  //       callback(`Duplicates in title column are not allowed in table ${collection}.`);
  //     } else { // actual insert
  //       const insertion = JSON.stringify(documentContentObject);
  //       dbClient.query(`INSERT INTO \`${connectionOptions.database}\`.\`${collection}\` (title, content) VALUES ('${documentName}', '${insertion}')`, (error2, result2) => {
  //         if (error2) {
  //           debuglog(`Failed to add row in table ${collection}.`, error2);
  //           callback(`Failed to add row in table ${collection}.`);
  //         } else {
  //           debuglog(`Success to add row in table ${collection}.`);
  //           callback(false);
  //         }
  //       });
  //     }
  //   }
  // });
}

handlers.read = function(collection, documentName, callback){
  // dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error, result) => {
  //   if (error) {
  //     debuglog(`Failed to obtain results from quering table ${collection}.`, error);
  //     callback(true, {'Note':error.message});
  //   } else if (result.length === 0) {
  //     debuglog(`No results from quering table ${collection}.`);
  //     callback(true,`No results from quering table ${collection}.`);
  //   } else {
  //     debuglog(`Success to obtain results from quering table ${collection}.`);
  //     callback(false,JSON.parse(result[0].content));
  //   }
  // })
}

handlers.update = function(collection, documentName, documentContentObject, callback){
  // const updated = JSON.stringify(documentContentObject);
  // // Find some documents
  // dbClient.query(`UPDATE \`${connectionOptions.database}\`.\`${collection}\` SET \`content\`='${updated}' WHERE \`title\`='${documentName}'`, (error, result) => {
  //   // process the query results
  //   if (error) {
  //     debuglog(`Failed to update row in table ${collection}.`, error);
  //     callback(`Failed to add row in table ${collection}.`);
  //   } else if (result && result.changedRows === 0) {
  //     debuglog(`Failed to update row in table ${collection}.`);
  //     callback(`Failed to update row in table ${collection}.`);
  //   } else {
  //     debuglog(`Success to update row in table ${collection}.`);
  //     callback(false);
  //   }
  // });
}

handlers.delete = function(collection, documentName, callback){
  // Find some documents
  // dbClient.query(`DELETE FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`,function(error, result) {
  //   // process the query results
  //   if (error) {
  //     debuglog(`Failed to query row for deletion from table ${collection}.`, error);
  //     callback(`Failed to query row for deletion from table ${collection}.`);
  //   } else if (result.affectedRows === 0) {
  //     debuglog(`Failed to match row for deletion from table ${collection}.`);
  //     callback(`Failed to match row for deletion from table ${collection}.`);
  //   } else {
  //     debuglog(`Success to delete row from table ${collection}.`);
  //     callback(false);
  //   }
  // });
}

handlers.list = function(collection, callback){
  // Find some documents
  // dbClient.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\``, (error, result) => {
  //   // process the query results
  //   if (error) {
  //     debuglog(`Failed to quiry for listing table ${collection}.`, error);
  //     callback(true, `Failed to quiry for listing table ${collection}.`);
  //   } else {
  //     debuglog(`Success to quiry for listing table ${collection}.`);
      
  //     let array = [];
  //     if (result && result.length !== 0) {
  //       array = result.map( element => element.title );
  //     }

  //     callback(false, array);
  //   }
  // });
}

// Client disconnection on cli exit
handlers.close = disconnect;

module.exports = handlers;

// Client connection and loading of the collections
client.getSession()
  .then(session => {
    debuglog(`Success to open client session.`);
    // debuglog(session.inspect());

    
  })
  .catch(error=>{
    debuglog(`Session failure: ${error}`);
  })

//     // load the menu db table
//     dbSingleQuery(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`menu\`(title varchar(4), content JSON, INDEX(title) )`);
    
//     // check if menu items are already loaded, load them if not
//     dbClient.query(`SELECT COUNT(*) FROM \`${connectionOptions.database}\`.\`menu\``, (error,result)=>{
//       if (error) {
//         debuglog('Error querying menu table.');
//       } else {
//         if (result[0]['COUNT(*)'] === 0 ) { // menu table is empty
//           let _path = path.join(__dirname, '/.data/menu/menu.json');
//           let _menu = '';
//           fs.readFile(_path,'utf-8', (error, data)=>{
//             if (error || !data) {
//               debuglog('Error reading menu.json', error.message);
//             } else {
//               _menu = JSON.parse(data);
//               dbClient.query(mysql.format(`INSERT INTO \`${connectionOptions.database}\`.\`menu\`(title, content) VALUES("menu",?)`, JSON.stringify(_menu)), (error, result) => {
//                 if (error) {
//                   debuglog('Menu is NOT loaded in the db.');
//                 } else {
//                   debuglog('Menu is loaded in the db.');
//                 }
//               });
//             }
//           });
//         } else {
//           debuglog('Menu is already loaded in the db.');
//         }
//       }

//       // create basic collections/ tables users, tokens, orders
//       dbClient.query(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`users\`(title varchar(255), content JSON, INDEX(title) )`, (error1, result) => {
//         if (!error1) {
//           debuglog('Users table/collection is ready to use.');
//           dbClient.query(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`tokens\`(title varchar(255), content JSON, INDEX( title) )`, (error2, result) => {
//             if (!error2) {
//               debuglog('Tokens table/collection is ready to use.');
//               dbClient.query(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`orders\`(title varchar(255), content JSON, INDEX(title) )`, (error3, result) => {
//                 if (!error3) {
//                   debuglog('Orders table/collection is ready to use.');
//                   // queries for manual testing may be placed here ...
//                 } else {
//                   debuglog('Basic tables/collections might NOT be ready to use.');
//                 }
//               });
//             } else {
//               debuglog('Basic tables/collections might NOT be ready to use.');
//             }
//           });
//         } else {
//           debuglog('Basic tables/collections might NOT be ready to use.');
//         }
//       });

// some testing handlers
// handlers.create('test','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('menu','menu',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); });
