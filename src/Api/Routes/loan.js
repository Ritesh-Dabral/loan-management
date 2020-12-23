/**
 * Loan routes: 
 *  loanRequest: POST (client)
 *  loanRequestFrwd: POST (agent)
 *  loanRequestStatusChange: PUT (admin)
 */

 const route           = require('express').Router();
 const {celebrate,Joi} = require('celebrate');
 const middlewares     = require('./../Middlewares/index');
 const loanServices    = require('../../Services/loan');
const Logger = require('../../Loaders/logger');


 const JoiSchema = {
     tenureSchema:Joi.number().integer().required().min(3).max(180),
     interestPerMonthSchema:Joi.number().required().min(300),
     usernameSchema:Joi.string().required().alphanum().trim().length(8).regex(/^CU[0-9]{6}$/),
     loanIdSchema:Joi.string().required().length(14).regex(/^LO[0-9]{12}$/).trim(),
     viewUsernameSchema:Joi.string().trim().regex(/^(allusers|CU[0-9]{6})$/i).required().length(8),
     statusSchema:Joi.string().trim().regex(/^(all|new|approved|rejected)$/i).required(),
     criteriaSchema:Joi.string().trim().regex(/^(creation|updation)$/i).default('creation').required(),
     sortSchema:Joi.string().trim().regex(/^(asc|desc)$/i).default('asc').required()
 }

 
 /**
  * This 'use' method checks all incoming requests 
  * for authenticated users and then attaches current user
  * to request as req['currentUser] as these routes are protected
  * 
  */
 route.use(middlewares.isAuth,middlewares.getCurrentUser);


 /**
  * Loan creation route that accepts tenure,interestPerMonth and the
  * customer's username...
  * celebrate checks and validates all req.body properties which we are going 
  * to use. Finally 'tenureAndUsernameCheck' middle ware validates 
  * tenure and username as loan should be generated only for 'customer' and if 
  * the username belongs to a customer , then 'getCustomer' middle ware 
  * attaches the customer with the given 'username' to req['customer']
  * 
  */
 route.post('/create', celebrate({
        body:Joi.object().keys({
            tenure:JoiSchema.tenureSchema,
            interestPerMonth: JoiSchema.interestPerMonthSchema,
            username:JoiSchema.usernameSchema
        })
    }),middlewares.onlyAgentAllowed,middlewares.tenureCheck,middlewares.getCustomer,
    async(req,res,next)=>{
        try {
            const {tenure,interestPerMonth} = req.body;
            const agentUsername = req['currentUser'].username;
            const minimumLoanAmount = await loanServices.createMinimumLoan(tenure,interestPerMonth,req['customer'],agentUsername);
            res.status(201).json({message:"Loan Request Successfully Created",minimumLoanAmount});            
        } catch (e) {
            Logger.debug('src/api/routes/loan/create');
            Logger.error(e.message);
            next(e);
        }
    }
 )


  /**
  * Loan edit route that accepts tenure,interestPerMonth and the
  * LoanId as parameter
  * celebrate checks and validates all req.body properties and req.params which we are going 
  * to use. Finally 'loanRequestCheck' middle ware validates 
  * tenure and if 
  * the loanId belongs to a loan , then 'isLoan' middle ware 
  * attaches the loan with the given 'loanId' to req['loan']
  * 
  */
 route.put('/edit/:loanId', celebrate({
    body:Joi.object().keys({
        tenure:JoiSchema.tenureSchema,
        interestPerMonth: JoiSchema.interestPerMonthSchema,
    }),
    params:Joi.object().keys({
        loanId:JoiSchema.loanIdSchema
    })
}),middlewares.onlyAgentAllowed,middlewares.tenureCheck, middlewares.isLoan,
    async(req,res,next)=>{
        try {
            const {tenure,interestPerMonth} = req.body;
            const {username} = req['currentUser'];
            await loanServices.updateLoan(tenure,interestPerMonth,req['loan'],username);
            res.status(201).json({message:"Loan Successfully Updated"});            
        } catch (e) {
            Logger.debug('src/api/routes/loan/edit/:loanId');
            Logger.error(e.message);
            next(e);
        }
    }
)


   /**
  * Loan approval route that accepts
  * LoanId as parameter
  * celebrate checks and validates all req.params properties . 
  * Finally admin approves or rejects a loan 
  * isLoan' middle ware 
  * attaches the loan with the given 'loanId' to req['loan']
  * 
  */
 route.put('/approval/:loanId/:status', celebrate({
    params:Joi.object().keys({
        loanId:JoiSchema.loanIdSchema,
        status:Joi.string().regex(/^(approved|rejected)$/i).required().trim()
    })
}),middlewares.onlyAdminAllowed, middlewares.isLoan,
    async(req,res,next)=>{
        try {
            const {status} = req.params;
            const {username} = req['currentUser'];
            await loanServices.loanStatusChange(req['loan'],status,username);
            res.status(201).json({message:"Loan Status Successfully Updated"});            
        } catch (e) {
            Logger.debug('src/api/routes/loan/approval/:loanId');
            Logger.error(e.message);
            next(e);
        }
    }
)


/**
 * Filter all data using only one route
 * username: only works on customer's username
 * status: the status of loan objects 
 * criteria: creation or updation
 * sort: sort the data ascending or descending
 */
 route.get('/view/:username/:status/:criteria/:sort',celebrate({
    params:Joi.object().keys({
        username:JoiSchema.viewUsernameSchema,
        status:JoiSchema.statusSchema,
        criteria:JoiSchema.criteriaSchema,
        sort:JoiSchema.sortSchema
    })
 }), middlewares.viewLoans,
    async(req,res,next)=>{
        try {

            const {username,status,sort,criteria} = req.params;
            const currUsername = req['currentUser'].username;
            const loans = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
            res.status(200).json({
                message:"Fetched loan details",
                loans
            })
        } catch (e) {
            Logger.debug('src/api/routes/loan/view/:username/:status/:criteria/:sort');
            Logger.error(e.message);
            next(e);            
        }
    }
 )
 

 /**************** MODULE EXPORTS *********/

 module.exports = route;