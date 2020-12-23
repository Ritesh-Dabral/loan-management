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
 const {isEmail, isInt, isEmpty, isAlphanumeric} = require('validator');

 /**
  * S C H E M A
  */
 const UserSchema = new mongoose.Schema({
     username:{
         type:String,
         index:true,
         required:['true','Username is required'],
         unique:true,
         minlength:[8,'Username: Only 8 characters long'],
         maxlength:[8,'Username: Only 8 characters long'],
         validate:[/^(SA|AG|AD|CU)[0-9]{6}$/, 'Not a valid username']
     },
     role:{
         type:String,
         required:['true','Role needs to be mentioned'],
         default:'customer'
     },
     password:{
         type:String,
         required:['true','Password is necessary'],
         minlength:[8,'Password: At least 8 characters long']
     },
     salt:{
         type:String,
         required:['true','Salt is missing']
     },
     email:{
         type:String,
         toLowerCase:true,
         required:['true','Email is required'],
         validate:[isEmail, 'Invalid email, try again'],
         maxlength:[300,'Email: At most 300 characters long'],
         unique:true
     },
     phoneNumber:{
         type:String,
         required:['true','Contact number is required'],
         validate:[/^[789]{1}[0-9]{9}$/,'Invalid Phone Number'],
         minlength:[10,'Phone Number: Only 10 digits long'],
         maxlength:[10,'Phone Number: Only 10 digits long'],
         unique:true
     },
     loans:{
         type:Array,
         default:[]
     },
     profilePic:{
         type:String,
         default:''
     },
     createdBy:{
         type:String,
         required:['true',`Creator's username is required`],
         minlength:[8,'Creator Username: Only 8 characters long'],
         maxlength:[8,'Creator Username: Only 8 characters long'],
         validate:[/^(SA|AG|AD|CU)[0-9]{6}$/, 'Not a valid creator username']
     },
     netMonthlySalary:{
         type:Number,
         required:['true',`Net monthly salary is required`],
         min:[25000, 'Salary cannot be less thn 25K'],
     },
     DOB:{
         type:String,
         required:['true',`DOB is required`],
     },
     firstName:{
         type:String,
         toLowerCase:true,
         required:['true','First name is required'],
         minlength:[3,'First name should have atleast 3 characters'],
         maxlength:[30,'First name can have at most 30 characters'],
         validate:[/^[a-zA-Z]+$/, 'Not a valid first name']
     },
     lastName:{
        type:String,
        toLowerCase:true,
        required:['true','Last name is required'],
        minlength:[3,'Last name should have atleast 3 characters'],
        maxlength:[30,'Last name can have at most 30 characters'],   
        validate:[/^[a-zA-Z]+$/, 'Not a valid last name']

     },
     cibilScore:{
         type:Number,
         required:['true',`Cibil Score is required`],
         min:[300, 'Cibil Score : >=300'],
         max:[900, 'Cibil Score : <= 900'],
     },
     newPass:{
         type:String
     }
 },{timestamps:true});

 // Role validation
UserSchema.path('role').validate(function (val){
    val = val.toLowerCase();
    if(val==='superadmin' || val==='admin' || val==='agent' || val==='customer')
        return true;
    return false;
}, 'Role can only be from [admin,agent,customer]');

UserSchema.path('DOB').validate(function (val){
    var todayYear = new Date().getFullYear();
    let DOB = String(val).split('-');
    let isdate=false,ismonth=false,isyear=false,isLeap=false;
    let date = parseInt(DOB[0]);
    let month = parseInt(DOB[1]);
    let year = parseInt(DOB[2]);

    if(date>=1 && date<=31){
        isdate=true;
    }
    if(month>=1 && month<=12){
        ismonth=true;
    }
    if((todayYear-year)>=21 && (todayYear-year)<=65){
        isyear = true;
    }

    // check for valid dates

    if(year%400==0 || (year%4==0 && year%100!=0)){
        isLeap = true;
    }
    
    if(date==31){
        if(month==2 || month==4 || month==6|| month ==9||month==11)
            return false;
    }
    else if(date==30){
        if(month==2)
            return false;
    }
    else if(date==29 && !isLeap){
        return false;
    }

    //main date check
    if(isdate && ismonth && isyear)
        return true;
    else
        return false;
}, 'DOB format dd-mm-yyyy (age>=21 and age<=65)');



 /**
  * M O D E L
  */

  module.exports = User = mongoose.model('Users',UserSchema);


