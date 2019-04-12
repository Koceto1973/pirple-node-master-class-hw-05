// data storage

// Local Dependencies
const fs = require('./fs');
const mongo = require('./mongo');
const mysql = require('./mysql');

const data = {};

// data storage router
const dataStorageRouter = (action) => {
  switch (process.env.NODE_STORAGE) {
    case 'fs': return fs[action];
               break;
    case 'mongo-native': return mongo[action];
                break;
    case 'mysql': return mysql[action];
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