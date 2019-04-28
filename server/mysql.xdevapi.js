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
  let rows = [];

  return client.getSession()
    .then(session => {
      debuglog(`Success to open client session.`);
      // debuglog(session.inspect());
      return session.getSchema(connectionObject.database).getTable(collection+'x')
        .select('title')
        .where( `title = '${documentName}'`)
        .execute(result => {
          rows.push(result[0])
        })
        .then(()=>{
          if (rows.length !== 0) {
            debuglog(`Duplicates in title column are not allowed in table ${collection}x.`);
            callback(`Duplicates in title column are not allowed in table ${collection}.x`);
          } else {
            return session.getSchema(connectionObject.database).getTable(collection+'x')
              .insert('title', 'content')
              .values(documentName, JSON.stringify(documentContentObject))
              .execute()
              .then(()=>{
                debuglog(`Success to add row in table ${collection}.`);
                callback(false);
              })
          }
        })
        .then(() => { // close session
          return session.close()
            .then(()=>debuglog(`Success to close client session.`))
        })
        .catch(err => { // close session on error or throw it
          return session.close()
            .then(() => {
              debuglog(`Success to close client session.`);
              throw err;
            })
            .catch(err => {
              debuglog(`Failure to close client session.`);
              throw err;
            });
        });
    })
    .catch(error=>{ // get session error catcher
      debuglog(`Error catched while in create session: ${error}`);
      callback(`Error catched while in create session: ${error}`)
    })
}

handlers.read = function(collection, documentName, callback){
  let rows = [];

  return client.getSession()
    .then(session => {
      debuglog(`Success to open client session.`);
      // debuglog(session.inspect());
      return session.getSchema(connectionObject.database).getTable(collection+'x')
        .select('content')
        .where( `title = '${documentName}'`)
        .execute(result => {
          rows.push(result[0])
        })
        .then(()=>{
          if (rows.length === 0) {
            debuglog(`Failed to match while querying database.`);
            callback(true, `Failed to match while querying database.`);
          } else {
            debuglog(`Success to match while querying database.`);
            callback(false, rows[0]);
          }
        })
        .then(() => { // close session
          return session.close()
            .then(()=>debuglog(`Success to close client session.`))
        })
        .catch(err => { // close session on error or throw it
          return session.close()
            .then(() => {
              debuglog(`Success to close client session.`);
              throw err;
            })
            .catch(err => {
              debuglog(`Failure to close client session.`);
              throw err;
            });
        });
    })
    .catch(error=>{ // get session error catcher
      debuglog(`Error catched while in read session: ${error}`);
      callback(true, `Error catched while in read session: ${error}`)
    })
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

// Client connection and loading of the basic collections
client.getSession()
  .then(session => {
    debuglog(`Success to open client session.`);
    // debuglog(session.inspect());
    return session.getSchema(connectionObject.database).existsInDatabase()
      .then(() => { // create table usersx
        return session.sql(`CREATE TABLE if not exists \`${connectionObject.database}\`.\`usersx\`(title varchar(4), content JSON, INDEX(title) )`)
          .execute();
      })
      .then(() => { // create table tokensx
        return session.sql(`CREATE TABLE if not exists \`${connectionObject.database}\`.\`tokensx\`(title varchar(4), content JSON, INDEX(title) )`)
          .execute();
      })
      .then(() => { // create table ordersx
        return session.sql(`CREATE TABLE if not exists \`${connectionObject.database}\`.\`ordersx\`(title varchar(4), content JSON, INDEX(title) )`)
          .execute();
      })
      .then(() => { // create table menux
        return session.sql(`CREATE TABLE if not exists \`${connectionObject.database}\`.\`menux\`(title varchar(4), content JSON )`)
          .execute()
      })
      .then(()=>{ // get menu data
        let _path = path.join(__dirname, '/.data/menu/menu.json');
        let data = fs.readFileSync(_path,'utf-8');
        if ( data instanceof Error ) {
          return Promise.reject(`Can't read /.data/menu/menu.json.`)
        } else {
          return Promise.resolve(JSON.parse(data))
        }
      })
      .then(menuData => { // store menu data in table menux if not loaded
        return session.getSchema(connectionObject.database).getTable('menux').count()
          .then(number => {
            if (number) { 
              return Promise.resolve()
            } else {
              return session.sql(`INSERT INTO \`${connectionObject.database}\`.\`menux\`(title, content) VALUES("menu",?)`)
                .bind(JSON.stringify(menuData))
                .execute()
            }
          })
      })
      .then(() => { // report results
        return Promise.resolve(`Basic tables ready to use in the database.`)
          .then((value)=>{
            debuglog(value);
          })
      })
      .then(() => { // close session
        return session.close()
          .then(()=>debuglog(`Success to close client session.`))
      })
      .catch(err => { // close session on error or throw it
        return session.close()
          .then(() => {
            debuglog(`Success to close client session.`);
            throw err;
          })
          .catch(err => {
            throw err;
          });
      });
  })
  .catch(error=>{ // get session error catcher
    debuglog(`Error catched while in session: ${error}`);
  })

// some testing handlers
setTimeout(()=>{
  console.log('******************************')
  // handlers.create('users','one',{"a":1,"b":2,"c":3},(err,data)=>{ console.log(err); });
  // handlers.read('menu','menu',(err,data)=>{ console.log(err);  console.log(data); });
  // handlers.read('menu','benu',(err,data)=>{ console.log(err);  console.log(data); });
  // handlers.read('test','four',(err,data)=>{ console.log(err);  console.log(data); });
  // handlers.update('test','two',{'c':2},(err)=>{console.log(err)});
  // handlers.update('test','three',{'c':2},(err)=>{console.log(err)});
  // handlers.delete('test','three',(err)=>{console.log(err)});
  // handlers.list('test',(err,data)=>{ console.log(err); console.log(data); });
}, 1000);
