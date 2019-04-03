// Primary file for API

// Dependencies
var server = require('./server/server');
var cli = require('./server/cli');

// Declare the app
var app = {};

// Init function
app.init = function(callback){ // artificial callback argument, to accomodate done() in testing suite

  // Start the server
  server.init();

  // Start the CLI, but make sure it starts last
  setTimeout(function(){
    if ( process.env.NODE_ENV !== 'testing') {
      cli.init();
    }
    callback();
  },50);
  
};

// do not invoke if loading the module after being required
// do invoke if loading the module after terminal command: node moduleName
if(require.main === module){
  app.init(function(){});
}

// Export the app, usefull for api testing later on
module.exports = app;
