/**
 * Check the role of user,
 * only admin is allowed access to these Routes
 * 
 * this middleware checks the req['currentUser']
 * passed by the /src/api/middlewares/getCurrentUser
 */

const Logger = require("../../Loaders/logger")

const onlyAdminAllowed = async(req,res,next)=>{
    try {
       Logger.silly('✅ Only Agent Allowed');
       const {role} = req['currentUser'];

       if(role.toLowerCase()!=='admin'){
            // 401 forbidden access
            return res.sendStatus(401);
       }

       next();
    } catch (e) {
       Logger.debug('src/api/middlewares/onlyAdminAllowed');
       return next(e);
    }
}

module.exports = onlyAdminAllowed;