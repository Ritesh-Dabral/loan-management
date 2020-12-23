/**
 * import loaders here
 */

 const express = require('express');
 const Loaders = require('./Loaders/index');
 const Config  = require('./Config/index');
 const Logger  = require('./Loaders/logger');

async function startServer() {
    // set this app const from express module
    const app = express();

    // now send the 'app' to the index.js from Loaders
    await Loaders(app);

    // finally start the server

    app.listen(Config.port, ()=>{
       Logger.info(`
       ################################################
           ✔️  Server listening on port: ${Config.port} ✔️
       ################################################
       `)
    });
}

startServer();
