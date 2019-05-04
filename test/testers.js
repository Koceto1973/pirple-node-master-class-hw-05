// testing helpersiliaries

// Dependencies
var assert = require('assert');
var https = require('https');

const config = require('../server/config');
var app = require('../index'); // required without app.init() invokation

const helpers = {};

helpers.app = function(_name, done){
  assert.doesNotThrow(function(){
    app.init(function(){
      done();
    });
  },TypeError);
}

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
      queryString +=encodeURIComponent(key) + '=' + encodeURIComponent(queries[key]);
    }
  }

  if(JSON.stringify(queries)!=='{}') { requestOptions.path = path + queryString; }

  // Instantiate the request object
  var req = https.request(requestOptions,function(res){

    var chunks = [];
    
    res.on("data", function (chunk) { chunks.push(chunk); });

    res.on("end", function () {
      if(res.statusCode == 200 || res.statusCode == 201){ callback(false,JSON.parse(Buffer.concat(chunks))); } 
      else { callback(res.statusCode, JSON.parse(Buffer.concat(chunks)));}
    });
  });

  req.on('error',function(e){
    callback(500,e);
  });

  if(JSON.stringify(body)!=='{}') { req.write(JSON.stringify(body)); };
  req.end();
};

helpers.ping = function(_name, done){
  helpers.createHttpsRequest('GET','/ping',{},{},{},(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
  });

  done();
}

helpers.notFound = function(_name, done){
  helpers.createHttpsRequest('GET','/blabla',{},{},{},(err,payloadData)=>{
    assert.equal(err,404);
  });
  done();
}

helpers.usersCRUD = function(name, done){

  var locals = {};
  
  // user post
  helpers.createHttpsRequest('POST','/api/users',{
    "Content-Type": "application/json"
  },{},{
    "name": name,
    "email": name + "@test.com",
    "address": "120th Pirple Cloud, Wonderland",
    "password": "password"
  },(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
    
    // token post
    helpers.createHttpsRequest('POST','/api/tokens',{
      "Content-Type": "application/json"
    },{},{
      "email": name + "@test.com",
      "password": "password"
    },(err,payloadData)=>{
      assert.equal(err,false);
      assert.notDeepEqual(payloadData,{});
      assert.equal(name + "@test.com",payloadData.email);
      locals.token1 = JSON.parse(JSON.stringify(payloadData));

      // user get
      helpers.createHttpsRequest('GET','/api/users',{
        "Content-Type": "application/json",
        "token": locals.token1.id
      },{
        "email": name + "@test.com"
      },{},(err,payloadData)=>{
        assert.equal(err,false);
        assert.notDeepEqual(payloadData,{});
        assert.equal(name + "@test.com",payloadData.email);
        assert.equal(name,payloadData.name);
  
        // user put
        helpers.createHttpsRequest('PUT','/api/users',{
          "Content-Type": "application/json",
          "token": locals.token1.id
        },{},{
          "email":name + "@test.com",
          "name": "Johnie"
        },(err,payloadData)=>{
          assert.equal(err,false);
          assert.deepEqual(payloadData,{});
          
          // user delete
          helpers.createHttpsRequest('DELETE','/api/users',{
            "Content-Type": "application/json",
            "token": locals.token1.id
          },{
            "email":name + "@test.com"
          },{},(err,payloadData)=>{
            assert.equal(err,false);
            assert.deepEqual(payloadData,{});

            // token delete
            helpers.createHttpsRequest('DELETE','/api/tokens',{
              "Content-Type": "application/json"
            },{
              "id": locals.token1.id
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

helpers.tokensCRUD = function(name, done){

  let locals = {};
  
  // user post
  helpers.createHttpsRequest('POST','/api/users',{
    "Content-Type": "application/json"
  },{},{
    "name": name,
    "email": name + "@test.com",
    "address": "120th Pirple Cloud, Wonderland",
    "password": "password"
  },(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
    
    // token post
    helpers.createHttpsRequest('POST','/api/tokens',{
      "Content-Type": "application/json"
    },{},{
      "email": name + "@test.com",
      "password": "password"
    },(err,payloadData)=>{
      assert.equal(err,false);
      assert.notDeepEqual(payloadData,{});
      assert.equal(name + "@test.com",payloadData.email);
      locals.token2 = JSON.parse(JSON.stringify(payloadData));

      // token get
      helpers.createHttpsRequest('GET','/api/tokens',{},{
        "id": locals.token2.id
      },{},(err,payloadData)=>{
        assert.equal(err,false);
        assert.notDeepEqual(payloadData,{});
        assert.equal(name + "@test.com",payloadData.email);
          
        // token put
        helpers.createHttpsRequest('PUT','/api/tokens',{
          "Content-Type": "application/json"
        },{},{
          "id": locals.token2.id,
          "extend": true
        },(err,payloadData)=>{
          assert.equal(err,false);
          assert.deepEqual(payloadData,{});
          
          // user delete
          helpers.createHttpsRequest('DELETE','/api/users',{
            "Content-Type": "application/json",
            "token": locals.token2.id
          },{
            "email":name + "@test.com"
          },{},(err,payloadData)=>{
            assert.equal(err,false);
            assert.deepEqual(payloadData,{});

            // token delete
            helpers.createHttpsRequest('DELETE','/api/tokens',{
              "Content-Type": "application/json"
            },{
              "id": locals.token2.id
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

helpers.ordersCRUD = function(name, done){

  let locals = {};
  
  // user post
  helpers.createHttpsRequest('POST','/api/users',{
    "Content-Type": "application/json"
  },{},{
    "name": name,  
    "email": name + "@test.com",
    "address": "120th Pirple Cloud, Wonderland",
    "password": "password"
  },(err,payloadData)=>{
    assert.equal(err,false);
    assert.deepEqual(payloadData,{});
    
    // token post
    helpers.createHttpsRequest('POST','/api/tokens',{
      "Content-Type": "application/json"
    },{},{
      "email": name + "@test.com",
      "password": "password"
    },(err,payloadData)=>{
      assert.equal(err,false);
      assert.notDeepEqual(payloadData,{});
      assert.equal(name + "@test.com",payloadData.email);
      locals.token3 = JSON.parse(JSON.stringify(payloadData));

      // menu get
      helpers.createHttpsRequest('GET','/api/menu',{
        "token": locals.token3.id,
        "email": name + "@test.com"
      },{},{},(err,payloadData)=>{
        assert.equal(err,false);
        assert.deepEqual(payloadData,{
          "Margherita": 2.90,
          "Funghi": 3.60,
          "Capricciosa": 3.30,
          "Quattro Stagioni": 3.70,
          "Vegetariana": 2.80,
          "Marinara": 4.20,
          "Peperoni": 3.40,
          "Napolitana":3.50,
          "Hawaii": 3.20,
          "Maltija": 3.60,
          "Calzone": 4.20,
          "Rucola": 3.50,
          "Bolognese": 3.60,
          "Meat Feast": 4.30,
          "Kebabpizza": 4.00,
          "Mexicana": 3.90,
          "Quattro Formaggi": 4.20
        });
        
        // order post
        helpers.createHttpsRequest('POST','/api/orders',{
          "token": locals.token3.id
        },{},{
          "email": name + "@test.com",
          "order": [1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        },(err,payloadData)=>{
          assert.equal(err,false);
          locals.order = payloadData;
          
          // order get
          helpers.createHttpsRequest('GET','/api/orders',{
            "token": locals.token3.id,
            "email": name + "@test.com",
            "order": locals.order.orderId
          },{},{},(err,payloadData)=>{
            assert.equal(err,false);
            assert.equal(payloadData.id,locals.order.orderId);
            assert.equal(payloadData.status,'accepted');

            // order put
            helpers.createHttpsRequest('PUT','/api/orders',{
              "Content-Type": "application/json",
              "token": locals.token3.id,
              "order": locals.order.orderId
            },{},{
              "email": name + "@test.com",
              "order":[5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0]
            },(err,payloadData)=>{
              assert.equal(err,false);
              
              // order payment
              helpers.createHttpsRequest('POST','/api/orders/payments',{
                "Content-Type": "application/json",
                "token": locals.token3.id,
                "email":name + "@test.com"
              },{
                "id": locals.order.orderId,
                "source": encodeURIComponent("tok_visa"),
                "currency": "usd",
                "description": encodeURIComponent("pizza order test stripe payment")
              },{},(err,payloadData)=>{
                assert.equal(err,false);
                assert.deepEqual(payloadData,{
                  "Success": "Check your email for details"
              });

                // order delete
                helpers.createHttpsRequest('DELETE','/api/orders',{
                  "Content-Type": "application/json",
                  "token": locals.token3.id,
                  "email": name + "@test.com"
                },{
                  "id": locals.order.orderId
                },{},(err,payloadData)=>{
                  assert.equal(err,403);
                  assert.deepEqual(payloadData,{'Error' : 'Order is not amendable'});

                  // user delete
                  helpers.createHttpsRequest('DELETE','/api/users',{
                    "Content-Type": "application/json",
                    "token": locals.token3.id
                  },{
                    "email": name + "@test.com"
                  },{},(err,payloadData)=>{
                    assert.equal(err,false);
                    assert.deepEqual(payloadData,{});

                    // token delete
                    helpers.createHttpsRequest('DELETE','/api/tokens',{
                      "Content-Type": "application/json"
                    },{
                      "id": locals.token3.id
                    },{},(err,payloadData)=>{
                      assert.equal(err,false);
                      assert.deepEqual(payloadData,{});
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  done();
}

module.exports = helpers;