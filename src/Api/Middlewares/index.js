/**
 * Single point to export all middlewares
 */

 const isAuth              = require('./isAuth');
 const getCurrentUser      = require('./getCurrentUser');
 const noCustomerAllowed   = require('./noCustomerAllowed');
 const tenureCheck         = require('./tenureCheck');
 const getCustomer         = require('./getCustomer');
 const isLoan              = require('./isLoan');
 const onlyAgentAllowed    = require('./onlyAgent');
 const onlyAdminAllowed    = require('./onlyAdminAllowed');
 const viewLoans           = require('./viewLoans');


 module.exports = {
   isAuth,
   getCurrentUser,
   noCustomerAllowed,
   tenureCheck,
   getCustomer,
   isLoan,
   onlyAgentAllowed,
   onlyAdminAllowed,
   viewLoans
 }