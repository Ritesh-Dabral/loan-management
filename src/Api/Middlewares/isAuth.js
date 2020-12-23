/**
 * Checks the authenticity of user,
 * by parsing the token received from the header
 * 
 * this allows us to protect the routes that requires authorization
 * like, creating new User
 * 
 */

 const expressJwt = require('express-jwt');
 const config     = require('../../Config/index');

 const getTokenFromHeaderAndVerify = (req)=>{
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
      ) {
        return req.headers.authorization.split(' ')[1];
      }
      return null;
 }


  /**
  * requestProperty: defines the property on 'req' 
  * and sends it to the next middleware, can access it using
  * req.user (contains the object stored inside token)
  */
 
 module.exports = expressJwt({
     secret:config.jwtSecret,
     requestProperty: 'user',
     issuer:'redcarpetAssignment',
     getToken: getTokenFromHeaderAndVerify,
     algorithms: ['HS256']
 })