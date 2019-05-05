// MySQL specific interface

// Global Dependencies
const fs = require('fs');
const path = require('path');
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
    database: mysqlDbName, 
    connectionLimit: 10
  }
} else {
  // connectionOptions = { // option for running local app with remote db
  //   host: mysqlDbServer,
  //   port: mysqlDbPort,
  //   user: user,
  //   password: password,
  //   database: mysqlDbName, 
  //  connectionLimit: 10
  // }
  connectionOptions = {
    host: '127.0.0.1',
    port:3307,
    user: 'root',
    password: passwordLocal,
    database: 'pizza-db', 
    connectionLimit: 10
  }
}

// hooking pool of connections to db server
const pool = (connectionOptions, dbName = undefined) => {
  if (dbName){
    connectionOptions.database = dbName;
  }
  debuglog('*** created pool of connections to db server');
  return mysql.createPool(connectionOptions);
}

// db pool instance
const dbPool = pool(connectionOptions);

// single db query with formated result and callback
const dbSingleQuery = (query, callback) => {
  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      conn.query(query, function (err, ...others) {
        debuglog("*** db query summary:", query);
        try {
          if (err) throw err;
          debuglog('Query SUCCEEDED');
          Array.prototype.forEach.call(others,curr=>{
            if (curr) debuglog(curr);
          });
          if (callback) { callback(); }
          conn.release();
        } catch (error) {
          debuglog("Query FAILED", error.sqlMessage);
          conn.release();
        }
      })
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  })
};

// closing db connection of the db server hook
const disconnect = (callback, pool = dbPool) => pool.end((err)=>{
  try {
    if (err) throw err;
    // connection established
    debuglog('*** Pool db connections, disconnected.');
    callback(0);
  } catch (error) {
    debuglog('*** Pool of db connections, error on disconnection:', error.sqlMessage);
    callback(1);
  }
});

const handlers = {};

handlers.create = function(collection, documentName, documentContentObject, callback){

  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      // check for duplicates before creation
      conn.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error1, result1) => {
        if (error1){ // query error
          debuglog(`Failed to read row from table ${collection}.`, error1);
          callback(`Failed to read row from table ${collection}.`);
          conn.release();
        } else { // documentName exists in db
          if ( result1.length !== 0) {
            debuglog(`Duplicates in title column are not allowed in table ${collection}.`);
            callback(`Duplicates in title column are not allowed in table ${collection}.`);
            conn.release();
          } else { // actual insert
            const insertion = JSON.stringify(documentContentObject);
            conn.query(`INSERT INTO \`${connectionOptions.database}\`.\`${collection}\` (title, content) VALUES ('${documentName}', '${insertion}')`, (error2, result2) => {
              if (error2) {
                debuglog(`Failed to add row in table ${collection}.`, error2);
                callback(`Failed to add row in table ${collection}.`);
                conn.release();
              } else {
                debuglog(`Success to add row in table ${collection}.`);
                callback(false);
                conn.release();
              }
            });
          }
        }
      });
      
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  })
  
}

handlers.read = function(collection, documentName, callback){

  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      conn.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`, (error, result) => {
        if (error) {
          debuglog(`Failed to obtain results from quering table ${collection}.`, error);
          callback(true, {'Note':error.message});
          conn.release();
        } else if (result.length === 0) {
          debuglog(`No results from quering table ${collection}.`);
          callback(true,`No results from quering table ${collection}.`);
          conn.release();
        } else {
          debuglog(`Success to obtain results from quering table ${collection}.`);
          callback(false,JSON.parse(result[0].content));
          conn.release();
        }
      })
      
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  });
  
}

handlers.update = function(collection, documentName, documentContentObject, callback){

  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      const updated = JSON.stringify(documentContentObject);
      // Find some documents
      conn.query(`UPDATE \`${connectionOptions.database}\`.\`${collection}\` SET \`content\`='${updated}' WHERE \`title\`='${documentName}'`, (error, result) => {
        // process the query results
        if (error) {
          debuglog(`Failed to update row in table ${collection}.`, error);
          callback(`Failed to add row in table ${collection}.`);
          conn.release();
        } else if (result && result.changedRows === 0) {
          debuglog(`Failed to update row in table ${collection}.`);
          callback(`Failed to update row in table ${collection}.`);
          conn.release();
        } else {
          debuglog(`Success to update row in table ${collection}.`);
          callback(false);
          conn.release();
        }
      });
      
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  });

}

handlers.delete = function(collection, documentName, callback){

  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      // Find some documents
      conn.query(`DELETE FROM \`${connectionOptions.database}\`.\`${collection}\` WHERE \`title\`='${documentName}'`,function(error, result) {
        // process the query results
        if (error) {
          debuglog(`Failed to query row for deletion from table ${collection}.`, error);
          callback(`Failed to query row for deletion from table ${collection}.`);
          conn.release();
        } else if (result.affectedRows === 0) {
          debuglog(`Failed to match row for deletion from table ${collection}.`);
          callback(`Failed to match row for deletion from table ${collection}.`);
          conn.release();
        } else {
          debuglog(`Success to delete row from table ${collection}.`);
          callback(false);
          conn.release();
        }
      });
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  });

}

handlers.list = function(collection, callback){

  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      // Find some documents
      conn.query(`SELECT * FROM \`${connectionOptions.database}\`.\`${collection}\``, (error, result) => {
        // process the query results
        if (error) {
          debuglog(`Failed to quiry for listing table ${collection}.`, error);
          callback(true, `Failed to quiry for listing table ${collection}.`);
          conn.release();
        } else {
          debuglog(`Success to quiry for listing table ${collection}.`);
          
          let array = [];
          if (result && result.length !== 0) {
            array = result.map( element => element.title );
          }

          callback(false, array);
          conn.release();
        }
      });
      
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  });

}

// Client connection close on cli exit
handlers.close = disconnect;

module.exports = handlers;

// time offset for initialization, so pool of connections is ready
setTimeout(()=>{

  // load users, tokens and orders
  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      // create basic collections/ tables users, tokens, orders
      conn.query(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`users\`(title varchar(255), content JSON, INDEX(title) )`, (error1, result) => {
        if (!error1) {
          debuglog('Users table/collection is ready to use.');
          conn.query(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`tokens\`(title varchar(255), content JSON, INDEX( title) )`, (error2, result) => {
            if (!error2) {
              debuglog('Tokens table/collection is ready to use.');
              conn.query(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`orders\`(title varchar(255), content JSON, INDEX(title) )`, (error3, result) => {
                if (!error3) {
                  debuglog('Orders table/collection is ready to use.');
                  conn.release();
                  // queries for manual testing may be placed here ...
                } else {
                  debuglog('Basic tables/collections might NOT be ready to use.');
                  conn.release();
                }
              });
            } else {
              debuglog('Basic tables/collections might NOT be ready to use.');
              conn.release();
            }
          });
        } else {
          debuglog('Basic tables/collections might NOT be ready to use.');
          conn.release();
        }
      });
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  });
  
  // load the menu db table
  dbPool.getConnection((err, conn)=>{
    if (!err && conn) {
      
      dbSingleQuery(`CREATE TABLE if not exists \`${connectionOptions.database}\`.\`menu\`(title varchar(4), content JSON, INDEX(title) )`);
      
      // check if menu items are already loaded, load them if not
      conn.query(`SELECT COUNT(*) FROM \`${connectionOptions.database}\`.\`menu\``, (error,result)=>{
        if (error) {
          debuglog('Error querying menu table.');
          conn.release();
        } else {
          if (result && result[0]['COUNT(*)'] === 0 ) { // menu table is empty
            let _path = path.join(__dirname, '/.data/menu/menu.json');
            let _menu = '';
            fs.readFile(_path,'utf-8', (error, data)=>{
              if (error || !data) {
                debuglog('Error reading menu.json', error.message);
                conn.release();
              } else {
                _menu = JSON.parse(data);
                conn.query(mysql.format(`INSERT INTO \`${connectionOptions.database}\`.\`menu\`(title, content) VALUES("menu",?)`, JSON.stringify(_menu)), (error, result) => {
                  if (error) {
                    debuglog('Menu is NOT loaded in the db.');
                    conn.release();
                  } else {
                    debuglog('Menu is loaded in the db.');
                    conn.release();
                  }
                });
              }
            });
          } else {
            debuglog('Menu is already loaded in the db.');
          }
        }
  
      });
    } else {
      debuglog(`Error to get connection from the pool.`);
    }
  });
},1000*1/10);



// some testing handlers
// handlers.create('test','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
// handlers.read('menu','menu',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
// handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
// handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
// handlers.delete('test','three',(err)=>{console.log(err)});
// handlers.list('test',(err,data)=>{ console.log(err); console.log(data); });
