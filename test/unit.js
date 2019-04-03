//  Unit Tests

// Dependencies
var assert = require('assert');
var helpers = require('./../server/helpers');

// Holder for Tests
var unit = {};

unit['helpers.parseJsonToObject should not throw'] = function(name, done){
  ['string','{"name":"John", "age":31, "city":"New York"}','{"name":"John", "age":31,, ...'].
    forEach(el=>assert.doesNotThrow(function(){
      assert.equal(typeof helpers.parseJsonToObject(el),'object');
    },TypeError));
  done();
};

unit['helpers.verifyOrder should return true on valid input'] = function(name, done){
  [
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,4,0,0,0,5,0,0,0,4,0,0,2,0],
    [5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ].forEach(el=> assert.equal(helpers.verifyOrder(el),true));
  done();
};

unit['helpers.verifyOrder should return false on invalid input'] = function(name, done){
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [5,5,5,5,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1.3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ['a',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ].forEach(el=> assert.notEqual(helpers.verifyOrder(el),true));
  done();
};

unit['helpers.calculatePaymentAmount should calculate correctly'] = function(name, done){
  var results = [2.9,14.5,20,52.3,67.5];
  var idx = 0;
  
  [
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,4,0,0,0,5,0,0,0,4,0,0,2,0],
    [5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ].forEach(el=> {
    assert.equal(helpers.calculatePaymentAmount(el),results[idx]*100);
    idx++;
  });
  done();
}

// Export the tests to the runner
module.exports = unit;