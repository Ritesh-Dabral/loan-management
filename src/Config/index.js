/**
 * All .env configurations
 */

 require('dotenv').config();
 

 let nodeEnv = process.env.NODE_ENV;
 
 module.exports =  {

    port:process.env.PORT,

    mongodb:{
        uri: (nodeEnv==='test')?(process.env.TESTDB_URI):(process.env.MONGODB_URI)
    },

    loggerLevel : (nodeEnv==='test')?('silent'):(process.env.LOGGER_LVL),

    jwtSecret: process.env.JWT_SECRET,

    sendGrid:{
        apikey:(nodeEnv==='test')?(''):(process.env.SENDGRID_API),
        templates:{
            welcome:process.env.WELCOME_TEMP
        }
    }


 }