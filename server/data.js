// data storage

// Local Dependencies
const fs = require('./fs');
const mongo = require('./mongo');
const mongoose = require('./mongoose');
const mysql = require('./mysql');
const xdevapi = require('./mysql.xdevapi');

const data = {};

// data storage router
const dataStorageRouter = (action) => {
  switch (process.env.NODE_STORAGE) {
    case 'fs': return fs[action];
               break;
    case 'mongo-native': return mongo[action];
                break;
    case 'mongo-mongoose': return mongoose[action];
                break;
    case 'mysql': return mysql[action];
                break;
    case 'mysql': return xdevapi[action];
                break;
    default: return fs[action]; 
  }
}

// Write data to a file
data.create = dataStorageRouter('create');

// Read data from a file
data.read = dataStorageRouter('read');

// Update data in a file
data.update = dataStorageRouter('update');

// Delete a file
data.delete = dataStorageRouter('delete');

// List all the items in a directory
data.list = dataStorageRouter('list');

module.exports = data;