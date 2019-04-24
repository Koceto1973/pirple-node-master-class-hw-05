// Create and export configuration variables

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const cnfg = currentEnvironment !== 'production' ? require('./config.json') : '';

// Container for all environments
const environments = {};

// Staging (default) environment
environments.staging = {
  'httpsPort' : 3002,
  'envName' : 'staging',
  'storageType':process.env.NODE_STORAGE,
  'mongoUser': cnfg.mongoUser,
  'mongoPassword': cnfg.mongoPassword,
  'mongoDbServer': cnfg.mongoDbServer,
  'mongoDbName': cnfg.mongoDbName,
  'mysqlUser': cnfg.mysqlUser,
  'mysqlPassword': cnfg.mysqlPassword,
  'mysqlPasswordLocal': cnfg.mysqlPasswordLocal,
  'mysqlDbServer': cnfg.mysqlDbServer,
  'mysqlDbPort': cnfg.mysqlDbPort,
  'mysqlDbName': cnfg.mysqlDbName,
  'postgresUser': cnfg.postgresUser,
  'postgresPassword': cnfg.postgresPassword,
  'postgresPasswordLocal': cnfg.postgresPasswordLocal,
  'postgresDbServer': cnfg.postgresDbServer,
  'postgresDbPort': cnfg.postgresDbPort,
  'postgresDbName': cnfg.postgresDbName,
  'hashingSecret' : cnfg.hashingSecret,
  'authTokenStripe':cnfg.testAuthTokenStripe,
  'apiKeyMailgun':cnfg.apiKeyMailgun,
  'domainNameMailgun':cnfg.domainNameMailgun,
  'templateGlobals' : {
    'appName' : 'Swifty Tasty Pizza',
    'companyName' : 'Easy, Inc.',
    'yearCreated' : '2019'
  },
};

// Testing environment
environments.testing = {
  'httpsPort' : 5002,
  'envName' : 'testing',
  'storageType':process.env.NODE_STORAGE,
  'mongoUser': cnfg.mongoUser,
  'mongoPassword': cnfg.mongoPassword,
  'mongoDbServer': cnfg.mongoDbServer,
  'mongoDbName': cnfg.mongoDbName,
  'mysqlUser': cnfg.mysqlUser,
  'mysqlPassword': cnfg.mysqlPassword,
  'mysqlPasswordLocal': cnfg.mysqlPasswordLocal,
  'mysqlDbServer': cnfg.mysqlDbServer,
  'mysqlDbPort': cnfg.mysqlDbPort,
  'mysqlDbName': cnfg.mysqlDbName,
  'postgresUser': cnfg.postgresUser,
  'postgresPassword': cnfg.postgresPassword,
  'postgresPasswordLocal': cnfg.postgresPasswordLocal,
  'postgresDbServer': cnfg.postgresDbServer,
  'postgresDbPort': cnfg.postgresDbPort,
  'postgresDbName': cnfg.postgresDbName,
  'hashingSecret' : cnfg.hashingSecret,
  'authTokenStripe':cnfg.testAuthTokenStripe,
  'apiKeyMailgun':cnfg.apiKeyMailgun,
  'domainNameMailgun':cnfg.domainNameMailgun,
  'templateGlobals' : {
    'appName' : 'Swifty Tasty Pizza',
    'companyName' : 'Easy, Inc.',
    'yearCreated' : '2019'
  },
};

// Production environment
environments.production = {
  'httpsPort' : process.env.PORT,
  'envName' : 'production',
  'storageType':process.env.NODE_STORAGE,
  'mongoUser': process.env.mongoUser,
  'mongoPassword': process.env.mongoPassword,
  'mongoDbServer': process.env.mongoDbServer,
  'mongoDbName': process.env.mongoDbName,
  'mysqlUser': cnfg.mysqlUser,
  'mysqlPassword': cnfg.mysqlPassword,
  'mysqlDbServer': cnfg.mysqlDbServer,
  'mysqlDbPort': cnfg.mysqlDbPort,
  'mysqlDbName': cnfg.mysqlDbName,
  'postgresUser': cnfg.postgresUser,
  'postgresPassword': cnfg.postgresPassword,
  'postgresDbServer': cnfg.postgresDbServer,
  'postgresDbPort': cnfg.postgresDbPort,
  'postgresDbName': cnfg.postgresDbName,
  'hashingSecret' : process.env.hashingSecret,
  'authTokenStripe':process.env.AuthTokenStripe,
  'apiKeyMailgun':process.env.apiKeyMailgun,
  'domainNameMailgun':process.env.domainNameMailgun,
  'templateGlobals' : {
    'appName' : 'Swifty Tasty Pizza',
    'companyName' : 'Easy, Inc.',
    'yearCreated' : '2019'
  },
};

// Check that the current environment is one of the environments above, if not default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;