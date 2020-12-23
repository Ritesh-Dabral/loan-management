/**
 * Email Services
 * 
 * 
 */

 const sgMail  = require('@sendgrid/mail');
 const config  = require('../Config/index');
 const Logger  = require('../Loaders/logger');

 const sendWelcomeMail = async(email,username,password)=>{
     try {
         Logger.silly('Welcome Message Service Invoked');
         sgMail.setApiKey(config.sendGrid.apikey);

         const data = {
            to: email, //your email address
            from: 'urlsrty@gmail.com',
            templateId: config.sendGrid.templates.welcome,
      
            dynamic_template_data: {
                username,
                password
             }
          };

          const sent = await sgMail.send(data);
          
          if(!sent){
              throw Error('Internal Server Error');
          }

          return null;

     } catch (e) {
         Logger.debug('src/services/mailer/sendWelcomeMail');
         return e;
     }
 }


 /**************  MODULE EXPORTS ***********/

 module.exports = {
    sendWelcomeMail
 }