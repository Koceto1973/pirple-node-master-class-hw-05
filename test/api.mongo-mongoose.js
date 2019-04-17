// API Tests with Mongo DB ( via Mongoose package ) as a storage

// Dependencies
var assert = require('assert');

var testers = require('./testers');

// Holder for Tests
var api = {};

api['ping'] = testers.ping;

api['notFound'] = testers.notFound;

// users CRUD
// user post, token post, user get, user put, user delete, token delete
api['Mongo-Mongoose: users testing'] = testers.usersCRUD;

// tokens CRUD
// user post, token post, token get, token put, user delete, token delete
api['Mongo-Mongoose: tokens testing'] = testers.tokensCRUD;

// orders CRUD, menu get, order payment over Mongo DB storage via native driver
// user post, token post, menu get, order post, order get, order put, order payment, order delete, user delete, token delete
api['Mongo-Mongoose: orders testing'] = testers.ordersCRUD;

// Export the tests to the runner
module.exports = api;
