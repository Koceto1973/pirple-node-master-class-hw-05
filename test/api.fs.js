// API Tests with file system ( FS ) as a storage

// Dependencies
var helpers = require('./helpers');

// Holder for Tests
var api = {};

// also main app starter
api['app.init should not throw'] = helpers.app;

api['ping'] = helpers.ping;

api['notFound'] = helpers.notFound;

// users CRUD
api['FS: user post, token post, user get, user put, user delete, token delete'] = helpers.usersCRUD;

// tokens CRUD
api['FS: user post, token post, token get, token put, user delete, token delete'] = helpers.tokensCRUD;

// orders CRUD, menu get, order payment over fs storage
api['FS: user post, token post, menu get, order post, order get, order put, order payment, order delete, user delete, token delete'] = helpers.ordersCRUD;

// Export the tests to the runner
module.exports = api;