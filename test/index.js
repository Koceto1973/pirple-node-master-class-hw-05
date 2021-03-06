// Application Testing entry point

var handlers = require('./../server/handlers');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // ignore https error on self signed certificate

// Application logic for the test runner
_app = {};

// Holder of all tests
_app.tests = {};

// Test Dependencies, test groups are executed in this order - into the reccursive test runner
// amend configuration if necessary on addition of new test groups
_app.tests.unit = require('./unit');
_app.tests.apiFs = require('./api.fs');
_app.tests.apiMongoNative = require('./api.mongo-native');
_app.tests.apiMongoMongoose = require('./api.mongo-mongoose');
_app.tests.apiMySQL = require('./api.mysql');
_app.tests.apiMySQLxdevapi = require('./api.mysql-xdevapi');
_app.tests.apiPostgres = require('./api.postgres');

const groupTestTime = 5;

_app.groupTestsNamesArray = []; // [ unit, apiFS, apiMongoNative, etc. ]

// Count all the tests and populate the above array
_app.countTests = function(){
  var counter = 0;
  for(var key in _app.tests){
     if(_app.tests.hasOwnProperty(key)){
      _app.groupTestsNamesArray.push(key);
       var subTests = _app.tests[key];
       for(var testName in subTests){
          if(subTests.hasOwnProperty(testName)){
            counter++;
          }
       }
     }
  }
  return counter;
};

var limit = _app.countTests();
var errors = [];
var successes = 0;
var failures = 0;

// reccursive test runner
_app.runSubTests = function(index){
  // reccursion bottom
  if ( index === _app.groupTestsNamesArray.length ) return;

  // iterate testing over each storage after storage redirection
  console.log('Testing group:', _app.groupTestsNamesArray[index]);  
  let storageRedirector = '';
  switch (_app.groupTestsNamesArray[index]) {
    case 'apiFs': storageRedirector = 'fs'; break;
    case 'apiMongoNative': storageRedirector = 'mongo-native'; break;
    case 'apiMongoMongoose': storageRedirector = 'mongo-mongoose'; break;
    case 'apiMySQL': storageRedirector = 'mysql'; break;
    case 'apiMySQLxdevapi': storageRedirector = 'mysql-xdevapi'; break;
    case 'apiPostgres': storageRedirector = 'postgres'; break;
    default: storageRedirector = 'mongo-native';
  }  
  handlers.redirectStorage(storageRedirector);

  // some tiny delay to catch up with storage switch before running the tests
  setTimeout(()=>{
    var subTests = _app.tests[_app.groupTestsNamesArray[index]];
    for(var testName in subTests){
      if(subTests.hasOwnProperty(testName)){
        (function(){
          var tmpTestName = testName;
          var testValue = subTests[testName];
          // Call the test
          try{
            testValue(encodeURIComponent(_app.groupTestsNamesArray[index]+testName), function(){ // the done() callback function

              // If it calls back without throwing, then it succeeded, so log it in green
              console.log('\x1b[32m%s\x1b[0m',tmpTestName);
              successes++;
              if(successes + failures == limit){
                _app.produceTestReport(limit,successes,errors);
              }
            });
          } catch(e){
            // If it throws, then it failed, so capture the error thrown and log it in red
            errors.push({
              'name' : testName,
              'error' : e
            });
            console.log('\x1b[31m%s\x1b[0m',tmpTestName);
            failures++;
            if(successes + failures == limit){
              _app.produceTestReport(limit,successes,errors);
            }
          }
        })();
      }
    }
  }, 1000*( _app.groupTestsNamesArray[index] !== 'unit' ? 0.1 : 0 ));

  // some delay to complete all the tests in each storage case
  setTimeout(()=>{
    _app.runSubTests(index+1);
  },1000*( _app.groupTestsNamesArray[index] !== 'unit' ? groupTestTime : 0 ));
}

// Product a test outcome report
_app.produceTestReport = function(limit,successes,errors){
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ",limit);
  console.log("Pass: ",successes);
  console.log("Fail: ",errors.length);
  console.log("");

  // If there are errors, print them in detail
  if(errors.length > 0){
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(function(testError){
      console.log('\x1b[31m%s\x1b[0m',testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }
  console.log("");
  console.log("--------END TEST REPORT--------");
  
  setTimeout(()=>{
    console.log('app exit after testing...');
    process.exit(0);
  }, 1000*groupTestTime*(_app.groupTestsNamesArray.length-1));

};

// Run the tests
_app.runSubTests(0);