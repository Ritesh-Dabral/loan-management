/**
 * Get the Loan if available
 * 
 * at this moment, we have access to req.params,which have
 * a property of 'loanId' ,throw error, if isn't in the database
 */

const Logger = require("../../Loaders/logger");
const Loan   = require('../../models/loan');

const isLoan = async(req,res,next)=>{
    try {
        Logger.silly('✅ Loan Lookup');

        Logger.silly('Extracting Loan Id');
        const {loanId} = req.params;

        Logger.silly('Checking for loan');
        const loan = await Loan.findOne({"loanId":loanId});

        if(!loan){
            throw Error(`Invalid Loan Id`);
        }
        
        Logger.silly(`Adding loan prop to 'req' `);
        req['loan'] = loan;

        return next();
    } catch (e) {
        Logger.debug('/src/api/middlewares/isLoan')
        return next(e);
    }
}

module.exports = isLoan;