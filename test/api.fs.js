// API Tests with file system ( FS ) as a storage

// Dependencies
var assert = require('assert');

var testers = require('./testers');

// Holder for Tests
var api = {};

api['ping'] = testers.ping;

api['notFound'] = testers.notFound;

// users CRUD
// user post, token post before account verification, account verification, token post after account verification, user get, user put, user delete, token delete
api['FS: users testing'] = testers.usersCRUD;

// tokens CRUD
// user post, account verification, token post, token get, token put, user delete, token delete
api['FS: tokens testing'] = testers.tokensCRUD;

// orders CRUD, menu get, order payment over fs storage
// user post, account verification, token post, menu get, order post, order get, order put, order payment, order delete, user delete, token delete
api['FS: orders testing'] = testers.ordersCRUD;

// Export the tests to the runner
module.exports = api;
