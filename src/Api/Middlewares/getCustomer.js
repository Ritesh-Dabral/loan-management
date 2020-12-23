/**
 * Get the customer if available
 * 
 * at this moment, we have access to req.body,which have
 * a property of 'username' ,throw error, if isn't in the database
 * 
 * 
 */

const Logger = require("../../Loaders/logger");
const User   = require('../../models/user');

const getCustomer = async(req,res,next)=>{
    try {
        Logger.silly('✅ Checking Customer');

        Logger.silly('Extracting username');
        const {username} = req.body;
        Logger.warn(username);
        Logger.silly('Checking for customer');
        const user = await User.findOne({"username":username});

        if(!user){
            throw Error(`Invalid Customer`);
        }
        Logger.silly(`Adding customer prop to 'req' `);
        req['customer'] = user;

        return next();
    } catch (e) {
        Logger.debug('/src/api/middlewares/getCustomer')
        return next(e);
    }
}

module.exports = getCustomer;