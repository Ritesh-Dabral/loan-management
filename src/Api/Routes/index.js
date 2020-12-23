/**
 * Import all routes here
 * 
 */

 const authRoutes = require('./auth');
 const loanRoutes = require('./loan');

 module.exports = {
    authRoutes,
    loanRoutes
 }