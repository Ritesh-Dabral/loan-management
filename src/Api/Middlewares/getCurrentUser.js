/**
 * 
 * This middleware checks the req['user'] field returend by the 
 * isAuth using express-jwt 
 * Now check the user's existence and send it frwd
 */

 const Logger = require('../../Loaders/logger');
 const User   = require('../../models/user');

 const getCurrentUser = async(req,res,next)=>{
    try {
        Logger.silly('✅ Verifying User based on Token');

        Logger.silly('Extracting user id');
        const {_id} = req['user'];

        Logger.silly('Checking for user\'s existence');
        const UserDBResponse = await User.findById(_id);

        if(!UserDBResponse){
            // 401 : unauthorized access
            return res.sendStatus(401);
        }

        const user = UserDBResponse.toObject();
        Reflect.deleteProperty(user, 'password');
        Reflect.deleteProperty(user, 'salt');

        Logger.silly(`Adding currentUser prop to 'req' `);
        req['currentUser'] = user;

        return next();
    } catch (e) {
        Logger.debug('src/api/middlewares/getCurrentUser');
        return next(e);
    }
 }

 module.exports = getCurrentUser;