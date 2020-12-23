/**
 * This loader sets up the mongoose connections
 * 
 * mongoose: mongoose module
 * config: all .env configurations in one place
 */

 const mongoose   = require('mongoose');

 const config = require('../Config/index');

 module.exports = async ()=>{

      try {
            const options = { 
                  useNewUrlParser: true,
                  useUnifiedTopology: true, 
                  useFindAndModify: false,
                  useCreateIndex: true 
            }
            const newConnection = await mongoose.connect(config.mongodb.uri,options);
      
            if(!newConnection){
                  throw Error('Mongo setup failed');
            }
            
            return true;
      } catch (error) {
            console.log(error.message);
            return null;
      }

 }


