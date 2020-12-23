/**
 * This module is responsible 
 * for login and signing up of user
 * by admins or agents only
 * 
 */

 const route           = require('express').Router();
 const {celebrate,Joi} = require('celebrate');
 const Logger          = require('../../Loaders/logger');
 const authServices    = require('../../Services/auth');
 const middleWares     = require('../Middlewares/index');

 const JoiSchema = {
     emailSchema:Joi.string().email().trim().lowercase().required(),
     phoneNumberSchema:Joi.string().trim().regex(/^[789]{1}[0-9]{9}$/).required(),
     passwordSchema:Joi.string().required(),
     usernameSchema:Joi.string().required().alphanum().trim().length(8),
     firstNameSchema:Joi.string().required().trim().regex(/^[a-zA-Z]+$/).max(30, 'utf8'),
     lastNameSchema:Joi.string().required().trim().regex(/^[a-zA-Z]+$/).max(30, 'utf8'),
     netMonthlySalarySchema:Joi.number().required().min(25000),
     DOBSchema:Joi.string().required().regex(/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/).trim(),
 }

 /**
  * Route mainly for setting up superadmin
  * who is then responsible to signup admins
  */
 route.post('/setsuperadmin', async(req,res,next)=>{
     try {
        const {user,token} = await authServices.setSuperAdmin();
        res.status(201).json({user,token});
     } catch (e) {
         Logger.debug('/src/api/routes/auth/setsuperadmin');
         Logger.error(e.message);
         next(e);
     }
 })


 /**
  * Actual Signup Route
  * 
  */


  route.post('/createUser', middleWares.isAuth, middleWares.getCurrentUser,middleWares.noCustomerAllowed,
    celebrate({
        body:Joi.object().keys({
            email:JoiSchema.emailSchema,
            phoneNumber:JoiSchema.phoneNumberSchema,
            firstName: JoiSchema.firstNameSchema,
            lastName: JoiSchema.lastNameSchema,
            DOB: JoiSchema.DOBSchema,
            netMonthlySalary: JoiSchema.netMonthlySalarySchema
        })
    }),
        async(req,res,next)=>{
            try {
                const {email,phoneNumber,firstName,lastName,DOB,netMonthlySalary} = req.body;
                const {role,username} = req['currentUser'];
                const newUser = {
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    DOB,
                    netMonthlySalary,
                    role,
                    createdBy:username
                }
                const {user} = await authServices.createUser(newUser);
                res.status(201).json({
                    message:`User Created. Credentials sent to respective email from 'urlsrty@gmail.com' (Check Spam or Search for the mail, if not visible)`,
                    user
                })
            } catch (e) {
                Logger.debug('/src/api/routes/auth/createUser');
                Logger.error(e.message);
                next(e);   
            }
        }    
    )


    /**
     * Login , then you can create other users
     * 
     */
    route.post('/login', celebrate({
        body:Joi.object().keys({
            username:JoiSchema.usernameSchema,
            password:JoiSchema.passwordSchema
        })
    }),
        async (req,res,next)=>{
            try {
                const {username,password} = req.body;
                const {user,token} = await authServices.signin(username,password);
                res.status(200).json({user,token});
            } catch (e) {
                Logger.debug('/src/api/routes/auth/login');
                Logger.error(e.message);
                next(e); 
            }
        }
    )

 module.exports = route;