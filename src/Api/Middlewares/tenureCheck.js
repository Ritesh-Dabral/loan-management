/**
 * Checks tenure to be multiple of 6
 * 
 * at this moment, we have access to req.body,which have
 * a property of 'tenure' and 'username' and 'DOB'
 * 
 */

 const Logger = require("../../Loaders/logger")

 const tenureCheck = async(req,res,next)=>{
     try {
         Logger.silly('✅ Tenure Checking');
         const {tenure} = req.body;

         if(tenure%3!=0){
             throw Error('Tenure must be multiple of 3');
         }

         return next();
     } catch (e) {
         Logger.debug('/src/api/middlewares/tenureCheck')
         return next(e);
     }
 }


 module.exports = tenureCheck;