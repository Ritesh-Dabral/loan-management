/**
 * 
 * there is one superAdmin 
 * 
 * User Schema : {
 *  
 *  username,
 *  role,
 *  password,
 *  salt,
 *  email,
 *  phoneNumber,
 *  Loans:[]
 *  profilePic,
 *  createdOn
 * }
 * 
 */

const mongoose  = require('mongoose');

const LoanSchema = new mongoose.Schema({
    loanId:{
        type:String,
        index:true,
        required:['true','Loan Id is required'],
        unique:true,
        minlength:[14,'Loan Id: Only 14 characters long'],
        maxlength:[14,'Loan Id: Only 14 characters long'],
        validate:[/LO[0-9]{12}/,'Not a valid loan id']
    },
    customerUsername:{
        type:String,
        required:['true','Customer username is required'],
        minlength:[8,'Username: Only 8 characters long'],
        maxlength:[8,'Username: Only 8 characters long'],
        validate:[/CU[0-9]{6}/,'Not a valid customer username']
    },
    agentUsername:{
        type:String,
        required:['true','Agent username is required'],
        minlength:[8,'Username: Only 8 characters long'],
        maxlength:[8,'Username: Only 8 characters long'],
        validate:[/AG[0-9]{6}/,'Not a valid agent username']
    },
    status:{
        type:String,
        uppercase:true,
        required:['true','Loan status required'],
        default:'NEW'
    },
    minLoanAmount:{
        type:Number,
        required:['true','Minimum Loan Amount required'],
        min:[0, 'Loan amount cannot be negative']
    },
    interestPerMonth:{
        type:Number,
        required:['true','Monthly Interest Charges required'],
        min:[1, 'Interest Per Month Charges >0'],
    },
    totalLoanAmount:{
        type:Number,
        required:['true','Total Loan Amount required'],
        min:[1, 'Total Loan Amount >0'],
    },
    totalInterestApplied:{
        type:Number,
        required:['true','Total Interest Amount required'],
        min:[1, 'Total Interest Amount >0'],
    },
    tenure:{
        type:Number,
        required:['true','Tenure is required'],
        min:[1, 'Tenure >=3'],
        max:[180, 'Tenure <=180'],        
    },
    emi:{
        type:Number,
        required:['true',`EMI is required`],
        min:[0, 'EMI cannot be negative'],        
    },
    rateOfInterest:{
        type:Number,
        required:['true','Monthly Interest Rates required'],
        min:[0.0075, 'Interest Rates >=0.01'],
        max:[12.99, 'Interest Rates < 13 '],
    },
    relatedDocuments:{
        type:Array,
        default:[]
    }
}, {timestamps:true});


 // Status validation
 LoanSchema.path('status').validate(function (val){
    val = val.toUpperCase();
    if(val==='NEW' || val==='APPROVED' || val==='REJECTED')
        return true;
    return false;
}, 'Status can only be from [NEW,APPROVED,REJECTED]');

 // Tenure validation
 LoanSchema.path('tenure').validate(function (val){
    if(val%3!==0)
        return false;
    return true;
}, 'Tenure must be multiple of 3 and >=3');




 /**
  * M O D E L
  */

 module.exports = Loan = mongoose.model('loans',LoanSchema)