// API Tests with Mongo DB via native driver ( mongo-native ) as a storage

// Dependencies
var helpers = require('./helpers');

// Holder for Tests
var api = {};

// also main app starter
//api['app.init should not throw'] = helpers.app;

api['ping'] = helpers.ping;

api['notFound'] = helpers.notFound;

// users CRUD
api['Mongo-Native: user post, token post, user get, user put, user delete, token delete'] = helpers.usersCRUD;

// tokens CRUD
api['Mongo-Native: user post, token post, token get, token put, user delete, token delete'] = helpers.tokensCRUD;

// orders CRUD, menu get, order payment over Mongo DB storage via native driver
api['Mongo-Native: user post, token post, menu get, order post, order get, order put, order payment, order delete, user delete, token delete'] = helpers.ordersCRUD;

// Export the tests to the runner
module.exports = api;