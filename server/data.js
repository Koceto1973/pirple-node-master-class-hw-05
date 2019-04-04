// data storage

// Local Dependencies
const fs = require('./fs');
const mongo = require('./mongo');

const data = {};

// data storage router
const router = (action) => {
  switch (process.env.NODE_STORAGE) {
    case 'fs': return fs[action];
               break;
    case 'mongo-native': return mongo[action];
                         break;
    default: return fs[action]; 
  }
}

// Write data to a file
data.create = router('create');

// Read data from a file
data.read = router('read');

// Update data in a file
data.update = router('update');

// Delete a file
data.delete = router('delete');

// List all the items in a directory
data.list = router('list');

module.exports = data;