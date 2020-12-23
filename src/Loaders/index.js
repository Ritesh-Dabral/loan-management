/**
 * import all kind of loaders here,
 * and then only import this file,
 * so less confusion will occur
 * 
 */

 const expressLoader  = require('./express');
 const mongooseLoader = require('./mongoose');
 const Logger         = require('./logger');

 /**
  * 
  * @param {*} app : Instance of express,
  * sent here from /src/app.js
  */
 module.exports = async(app)=>{
    await expressLoader(app);
    Logger.info('✌ Express Loaded');
    await mongooseLoader(app);
    Logger.info('✌ Database Loaded');
 } 
