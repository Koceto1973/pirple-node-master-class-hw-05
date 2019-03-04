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

  var counter = 0;
  var queryString = '?';
  for(var key in queries){
    if(queries.hasOwnProperty(key)){
      counter++;
      // If at least one query string parameter has already been added, preprend new ones with an ampersand
      if(counter > 1){
        queryString += '&';
      }
      // Add the key and value
      queryString += key+'='+queries[key];
    }
  }

  if(JSON.stringify(queries)!=='{}') { requestOptions.path = path + queryString; }

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

// users CRUD
api['user post , token post, user get, user put, user delete, token delete'] = function(done){
  
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
      helpers.token1 = JSON.parse(JSON.stringify(payloadData));

      // user get
      helpers.createHttpsRequest('GET','/api/users',{
        "Content-Type": "application/json",
        "token": helpers.token1.id
      },{
        "email": "ann@test.com"
      },{},(err,payloadData)=>{
        assert.equal(err,false);
        assert.notDeepEqual(payloadData,{});
        assert.equal('ann@test.com',payloadData.email);
        assert.equal('Ann',payloadData.name);
  
        // user put
        helpers.createHttpsRequest('PUT','/api/users',{
          "Content-Type": "application/json",
          "token": helpers.token1.id
        },{},{
          "email":"ann@test.com",
          "name": "Annie"
        },(err,payloadData)=>{
          assert.equal(err,false);
          assert.deepEqual(payloadData,{});
          
          // user delete
          helpers.createHttpsRequest('DELETE','/api/users',{
            "Content-Type": "application/json",
            "token": helpers.token1.id
          },{
            "email":"ann@test.com"
          },{},(err,payloadData)=>{
            assert.equal(err,false);
            assert.deepEqual(payloadData,{});

            // token delete
            helpers.createHttpsRequest('DELETE','/api/tokens',{
              "Content-Type": "application/json"
            },{
              "id": helpers.token1.id
            },{},(err,payloadData)=>{
              assert.equal(err,false);
              assert.deepEqual(payloadData,{});
            });
          });
        });
      });
    });
  });

  done();
}

// tokens CRUD
api['user post , token post, token get, token put, user delete, token delete'] = function(done){
  
  // user post
  helpers.createHttpsRequest('POST','/api/users',{
    "Content-Type": "application/json"
  },{},{
    "name": "Johny",  
    "email": "johny@test.com",
    "address": "120th Pirple Cloud, Wonderland",
    "password": "johnyspassword"
  },(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
    
    // token post
    helpers.createHttpsRequest('POST','/api/tokens',{
      "Content-Type": "application/json"
    },{},{
      "email": "johny@test.com",
      "password": "johnyspassword"
    },(err,payloadData)=>{
      assert.equal(err,false);
      assert.notDeepEqual(payloadData,{});
      assert.equal('johny@test.com',payloadData.email);
      helpers.token2 = JSON.parse(JSON.stringify(payloadData));

      // token get
      helpers.createHttpsRequest('GET','/api/tokens',{},{
        "id": helpers.token2.id
      },{},(err,payloadData)=>{
        assert.equal(err,false);
        assert.notDeepEqual(payloadData,{});
        assert.equal('johny@test.com',payloadData.email);
          
        // token put
        helpers.createHttpsRequest('PUT','/api/tokens',{
          "Content-Type": "application/json"
        },{},{
          "id": helpers.token2.id,
          "extend": true
        },(err,payloadData)=>{
          assert.equal(err,false);
          assert.deepEqual(payloadData,{});
          
          // user delete
          helpers.createHttpsRequest('DELETE','/api/users',{
            "Content-Type": "application/json",
            "token": helpers.token2.id
          },{
            "email":"johny@test.com"
          },{},(err,payloadData)=>{
            assert.equal(err,false);
            assert.deepEqual(payloadData,{});

            // token delete
            helpers.createHttpsRequest('DELETE','/api/tokens',{
              "Content-Type": "application/json"
            },{
              "id": helpers.token2.id
            },{},(err,payloadData)=>{
              assert.equal(err,false);
              assert.deepEqual(payloadData,{});
            });
          });
        });
      });
    });
  });

  done();
}

// Export the tests to the runner
module.exports = api;