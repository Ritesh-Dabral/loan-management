/**
 * Accumulation of all test files
 * 
 */

 const initTest  = require('./init');
 const loaderTest  = require('./loaders');
 const modelTest   = require('./models');
 const serviceTest = require('./services');
 const apiTest     = require('./api');
 

 describe('✅ Checks if jest is working >', initTest);
 describe('✅ Loaders >',loaderTest);
 describe('✅ Schema Tests >', modelTest);
 describe('✅ Services Tests >', serviceTest);
 describe('✅ Testing Routes >', apiTest);