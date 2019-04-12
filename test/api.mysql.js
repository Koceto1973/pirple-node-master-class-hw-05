// API Tests with Mongo DB via native driver ( mongo-native ) as a storage

// Dependencies
var assert = require('assert');

var testers = require('./testers');

// Holder for Tests
var api = {};

api['ping'] = testers.ping;

api['notFound'] = testers.notFound;

// users CRUD
api['MySQL: user post, token post, user get, user put, user delete, token delete'] = testers.usersCRUD;

// tokens CRUD
api['MySQL: user post, token post, token get, token put, user delete, token delete'] = testers.tokensCRUD;

// orders CRUD, menu get, order payment over Mongo DB storage via native driver
api['MySQL: user post, token post, menu get, order post, order get, order put, order payment, order delete, user delete, token delete'] = testers.ordersCRUD;

// Export the tests to the runner
module.exports = api;
