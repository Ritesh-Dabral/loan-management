/**
 * Authentication services based on 'src/api/routes/auth.js/
 * 
 */

 const Logger        = require('../Loaders/logger');
 const User          = require('../models/user');
 const argon2        = require('argon2');
 const crypto        = require('crypto');
 const jwt           = require('jsonwebtoken');
 const config        = require('../Config/index');
 const randomString  = require('randomstring');
 const mailerService = require('./mailer');


 /**
  * This Function Sets the SuperAdmin
  */
 const setSuperAdmin = async ()=>{

    const newUser = {
        username:'SA123456',
        role:'superadmin',
        password:'SA1234567',
        salt:'tatasaltnotsamoornsalt',
        email:'test123@gmail.com',
        phoneNumber:'7867329919',
        createdBy:'SA123456',
        netMonthlySalary:26000,
        DOB:'01-01-1993',
        firstName:'bruce',
        lastName:'wayne',
        cibilScore:750
    }

     try {
        Logger.silly('✅ Creating SuperAdmin');
        const salt = crypto.randomBytes(32);
        newUser.password = await argon2.hash(newUser.password, {salt:salt});
    
        newUser.salt = salt.toString('hex');
    
        const userDB = await User.create(newUser);

        if(!userDB){
            throw Error(`auth: Can't setup superAdmin`);
        }

        Logger.silly('Generating Token');
        const token = await generateToken(userDB);

        const user = userDB.toObject();
        Reflect.deleteProperty(user,'salt');

        return {user,token};
     } catch (e) {
        Logger.debug('src/services/auth/setSuperAdmin');
        throw e;
     }
 }

 /**
  * This function allows user to log into the system
  * 
  * @param {*} username : username provided by user
  * @param {*} password : associated password
  */
 const signin = async (username,password)=>{
     try {
         Logger.silly('✅ Sign in services invoked');
         Logger.silly('Searching for user!');
         const userDB = await User.findOne({"username":username});

         if(!userDB){
             throw Error(`auth: User not registered`);
         }
         Logger.silly('Matching Password');
         const validPassword = await argon2.verify(userDB.password, password);

         if(!validPassword){
            throw Error(`auth: Incorrect Password`);
         }
         Logger.silly('Generating Token');
         const token = await generateToken(userDB);
         
         const user = userDB.toObject();
         Reflect.deleteProperty(user,'password');
         Reflect.deleteProperty(user,'salt');


         return {user,token}

     } catch (e) {
         Logger.debug('src/services/auth/addUser');
         throw e;
     }
 }


 /**
  * 
  * @param {*} receivedUser : received old user ie (superadmin,admin,agent) only
  */
 const createUser = async(receivedUser)=>{
     try {
        Logger.silly('✅ Create User services invoked');

        Logger.silly('Generating Username based on role');
        let prefix = '',newUserRole='';
        if(receivedUser.role==='superadmin'){
            prefix='AD';
            newUserRole='admin';
        }else if(receivedUser.role==='admin'){
            prefix='AG';
            newUserRole='agent';
        }else if(receivedUser.role==='agent'){
            prefix='CU';
            newUserRole='customer';
        }else{
            throw Error('auth: Forbidden Access');
        }

        const username = prefix+String(receivedUser.phoneNumber).substr(-6);
        Logger.silly('Generating New Password');
        const newPass = randomString.generate({length:16,charset:'alphanumeric'});
        Logger.info(`password: ${newPass}`);
        Logger.silly('Generating Salt');
        const salt = crypto.randomBytes(32);
        Logger.silly('Hashing Password');
        const password = await argon2.hash(newPass, {salt:salt});
        Logger.silly('Creating User');
        const newUser = {
            username,
            role:newUserRole,
            password,
            salt:salt.toString('hex'),
            email:receivedUser.email,
            phoneNumber:receivedUser.phoneNumber,
            firstName:receivedUser.firstName,
            lastName: receivedUser.lastName,
            netMonthlySalary:receivedUser.netMonthlySalary,
            DOB:receivedUser.DOB,
            createdBy:receivedUser.createdBy,
            cibilScore: Math.floor(Math.random() * (900 - 300 + 1) + 300),
        }

        const userDB = await User.create(newUser);

        if(!userDB){
            throw Error(`auth: User Creation Error`);
        }

        Logger.silly('Sending Welcome Email and credentials');
        // will return null on success
        if(process.env.NODE_ENV!=='test'){
            const mail = await mailerService.sendWelcomeMail(receivedUser.email,username,newPass);

            if(mail){
                throw mail;
            }
        }

        const user = userDB.toObject();
        Reflect.deleteProperty(user,'password');
        Reflect.deleteProperty(user,'salt');

        return {user}
         
     } catch (e) {
        Logger.debug('src/services/auth/createUser');
        throw e; 
     }
 } 


 /**
  * Generates JWT token
  * 
  * @param {*} user : whole user data received from DataBase or created right now
  */
 async function generateToken(user){
    Logger.silly(`✅ Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        iss:'redcarpetAssignment'
      },
      config.jwtSecret,
      {
          expiresIn:'24h'
      }
    );
 }

 /************ MODULE EXPORTS **********/

 module.exports = {
    setSuperAdmin,
    signin,
    createUser
 }