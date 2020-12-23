/**
 * Whole Express Application 
 * With all routes and error handling functionality
 */

const bodyParser  = require('body-parser');
const cors        = require('cors');
const allRoutes   = require('../Api/Routes/index');
const Logger      = require('./logger');

module.exports = async (app)=>{

    /**
     * Additional Middlewares
     */
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded(
        {
            extended:true, 
            limit:'10mb', 
            parameterLimit:10000
        }
    ));


    /**
     * Routes
     * 
     */
    app.use('/api/auth',allRoutes.authRoutes);
    app.use('/api/loan',allRoutes.loanRoutes);

    /**
     * 404 routes
     */
    
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    /**
     * Error Handling Route
     */

    app.use((err, req, res, next)=>{
        let errorsMessage;
        
        // handle celebrate errors
        if(err.message.includes('celebrate')){

          err['status'] = 400;
          err.details.forEach((element,i) => {
            const errArr = Object.values(element);
            errArr.forEach((newErr,i)=>{
              if(i==1){
                const finErr = Object.values(newErr);
                errorsMessage = finErr[0].message;
              }
            });
          });
        }

        // mongoose duplicate errors
        else if(err.message.includes('E11000')){
          err['status'] = 400;
          errorsMessage = 'User with either email or phone number is already registered';
        }

        else if(err.message.includes('auth') || err.message.includes('loan')){
          err['status'] = 400;
          errorsMessage = err.message;
      }
        // mongoose duplicate errors
        else if(err.message.includes('401')){
            err['status'] = 401;
            errorsMessage = 'Access Forbidden: '+err.message;
        }



        // JWT unauthorized error (401)
        else if (err.name === 'UnauthorizedError') {
          err['status'] = 401;
          errorsMessage = 'Access Forbidden';
        }


        res.status(err.status || 500);
        res.json({
          errors: {
            message: errorsMessage||err.message,
          },
        });
    })


    return true;
}
