/**
 * This middleware has access to req['currentUser]
 * and allows the verifiction of users, who tries
 * to access the loan
 * 
 * it also has access to req.params which has 'username' property and
 * 'status' property
 * and fetches loans based on these criteria
 * 
 * by default req.params.username='all' and req.params.status='all'
 * 
 * 
 */

 const Logger = require("../../Loaders/logger");

 
 const viewLoans = async(req,res,next)=>{
     try {
        Logger.silly('✅ View Loan(s): Verifying User based on Token');

        Logger.warn('%o',req['currentUser']);
        const {username}=req['currentUser'];
        const prefix = String(username).substr(0,2);

        Logger.silly('Checking if user should be allowed access or not');
        if(prefix!=='AG' && prefix!=='AD' && prefix!=='CU'){
            // 401
            return res.sendStatus(401);
        }

        Logger.silly('Checking when user is customer, should be allowed access or not');
        if(prefix==='CU' && username!==req.params['username']){
            // 401
            return res.sendStatus(401);
        }

        return next();
     } catch (e) {
        Logger.debug('src/api/middlewares/viewLoans');
        return next(e);         
     }
 }


 module.exports = viewLoans;
