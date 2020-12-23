/**
 * A cool logging package to show logs
 * beautifully
 * 
 */

 const winston = require('winston');
 const config  = require('../Config/index');

 const Logger = winston.createLogger({
     level:config.loggerLevel,
     levels:winston.config.npm.levels,
     format:winston.format.combine(
         winston.format.simple(),
         winston.format.splat(),
         winston.format.cli()
     ),
     transports: [new winston.transports.Console()]
 });

 
 module.exports = Logger;