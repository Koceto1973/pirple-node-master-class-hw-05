// API Tests

// Dependencies
var assert = require('assert');
var app = require('./../index');

// Holder for Tests
var api = {};

// Helpers
var helpers = {};

api['function doesNotThrow testing'] = function(done){
  done();
}

// Export the tests to the runner
module.exports = api;