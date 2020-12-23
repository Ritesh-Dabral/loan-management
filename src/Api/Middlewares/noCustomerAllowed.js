/**
 * Check the role of user,
 * no client is allowed access to createUser Route
 * 
 * his middleware checks the req['currentUser']
 * passed by the /src/api/middlewares/getCurrentUser
 */

 const Logger = require("../../Loaders/logger")

 const noCustomerAllowed = async(req,res,next)=>{
     try {
        Logger.silly('✅ Checking Role');
        const {role} = req['currentUser'];

        if(role==='superadmin' || role==='admin'|| role==='agent'){
            return next();
        }
        else{
            // 401 forbidden access
            return res.sendStatus(401);
        }
     } catch (e) {
        Logger.debug('src/api/middlewares/checkRole');
        return next(e);
     }
 }

 module.exports = noCustomerAllowed;