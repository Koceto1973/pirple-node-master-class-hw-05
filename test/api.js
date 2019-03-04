// API Tests

// Dependencies
var assert = require('assert');
var app = require('./../index');
var config = require('./../server/config');
var https = require('https');
var querystring = require('querystring');

// Holder for Tests
var api = {};

// Helpers
var helpers = {};

helpers.createHttpsRequest = function(method,path,headers,queries,body,callback){

  var requestOptions = {
    "method": method,
    'protocol' : 'https:',
    "hostname": "127.0.0.1",
    "port": config.httpsPort,
    "path": path,
    "headers": headers
  };

  // Instantiate the request object
  var req = https.request(requestOptions,function(res){

    var chunks = [];
    
    res.on("data", function (chunk) { chunks.push(chunk); });

    res.on("end", function () {
      if(res.statusCode == 200 || res.statusCode == 201){ callback(false,JSON.parse(Buffer.concat(chunks))); } 
      else { callback(res.statusCode, {'Error':'Failed processing response correctly'}); }
    });    
  });

  req.on('error',function(e){
    callback(500,e);
  });

  if(JSON.stringify(queries)!=='{}') { req.write(querystring.stringify(queries)); }
  if(JSON.stringify(body)!=='{}') { req.write(JSON.stringify(body)); };
  req.end();
};

api['app.init should not throw'] = function(done){
  assert.doesNotThrow(function(){
    app.init(function(){
      done();
    });
  },TypeError);
}

api['ping'] = function(done){
  helpers.createHttpsRequest('GET','/ping',{},{},{},(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
  });

  done();
}

api['notFound'] = function(done){
  helpers.createHttpsRequest('GET','/blabla',{},{},{},(err,payloadData)=>{
    assert.equal(err,404);
  });
  done();
}

api['users post , token post'] = function(done){
  // user post
  helpers.createHttpsRequest('POST','/api/users',{
    "Content-Type": "application/json"
  },{},{
    "name": "Ann",  
    "email": "ann@test.com",
    "address": "120th Pirple Cloud, Wonderland",
    "password": "annspassword"
  },(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
    // token post
    helpers.createHttpsRequest('POST','/api/tokens',{
      "Content-Type": "application/json"
    },{},{
      "email": "ann@test.com",
      "password": "annspassword"
    },(err,payloadData)=>{
      assert.equal(err,false);
      assert.notDeepEqual(payloadData,{});
      assert.equal('ann@test.com',payloadData.email);
      helpers.token = JSON.parse(JSON.stringify(payloadData));
    });
  });

  done();
}

// Export the tests to the runner
module.exports = api;