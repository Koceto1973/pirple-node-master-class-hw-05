// API Tests with file system ( FS ) as a storage

// Dependencies
var assert = require('assert');

var testers = require('./testers');

// Holder for Tests
var api = {};

api['ping'] = testers.ping;

api['notFound'] = testers.notFound;

// users CRUD
api['FS: user post, token post, user get, user put, user delete, token delete'] = testers.usersCRUD;

// tokens CRUD
api['FS: user post, token post, token get, token put, user delete, token delete'] = testers.tokensCRUD;

// orders CRUD, menu get, order payment over fs storage
api['FS: user post, token post, menu get, order post, order get, order put, order payment, order delete, user delete, token delete'] = testers.ordersCRUD;

// Export the tests to the runner
module.exports = api;
