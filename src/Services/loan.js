/**
 * Loan services based on /src/api/routes/loan
 * 
 */

 const Logger = require("../Loaders/logger");
const loan = require("../models/loan");
 const Loan   = require('../models/loan');
const user = require("../models/user");
 const User   = require('../models/user');

 
 /**
  * Creates minimum loan
  * 
  * @param {*} tenure : Duration of loan
  * @param {*} interestPerMonth : charges per month
  * @param {*} custDet : Customer's detail
  * @param {*} agentUsername : agent's username
  */
 const createMinimumLoan = async(tenure,interestPerMonth,custDet,agentUsername)=>{
    try {
        Logger.silly('✅ Create minimum loan service invoked');
        
        Logger.silly('Calculating age with tenure period');
        const age = (new Date().getFullYear())-parseInt(custDet.DOB.split('-')[2]);
        if( (age+(tenure/12)) > 70){
            return `Loan cannot be generated as age and tenure period exceeds 70`;
        }

        Logger.silly('Checking cibil score of user');
        if(custDet.cibilScore<500){
            return `Loan cannot be generated as current cibil score is <500`;
        }

        Logger.silly('Calculating Minimum Loan Amount');
        const loanVal = generateMinimumLoan(tenure, interestPerMonth);

        if(!loanVal){
            throw Error(`loan:Loan value calculation exceeds our policy, max loan provided is 40Lakhs`);
        }

        Logger.silly('Compairing All EMIs');
        const createOrReject = await compareAllEMIs(loanVal.emi,custDet.netMonthlySalary,age,custDet.username,'XXX');

        if(!createOrReject){
            throw Error('loan:Not Eligible As Per Our Policies');
        }

        Logger.silly('Generating Loan Object');
        const loanId= 'LO'+String(custDet.phoneNumber).substr(-6)+String(Date.now()).substr(-6);

        const loanObj = {
            loanId,
            customerUsername:custDet.username,
            agentUsername,
            status:'NEW',
            minLoanAmount:loanVal.maxPossibleLoanAmount,
            interestPerMonth:loanVal.interestPerMonth,
            tenure,
            emi:loanVal.emi,
            rateOfInterest:loanVal.rateOfInterest,
            totalLoanAmount:loanVal.principalAmount,
            totalInterestApplied:loanVal.totalInterestCharged,
            relatedDocuments:[]
        }

        const loan = await Loan.create(loanObj);

        if(!loan){
            throw Error('loan:Loan Creation Failed');
        }

        Logger.silly(`Updating Customer's DB`);
        let updatedLoans = [...custDet.loans];
        updatedLoans.push(loan._id);

        const user = await User.findByIdAndUpdate(custDet._id,{"loans":updatedLoans});

        if(!user){
            Logger.error(`loan: Loan Updation Failed uid:${custDet._id} for loanId:${loanId}`);
        }

        return loan;
    } catch (e) {
        Logger.debug('src/services/loan/createMinimumLoan');
        throw e;
    }
 }


 /**
  * Updates a loan with new deatils
  * 
  * @param {*} tenure : Duration of loan
  * @param {*} interestPerMonth : charges per month
  * @param {*} loanData : loan details 
  */
 const updateLoan = async(tenure,interestPerMonth,loanData,username)=>{
     try {
        Logger.silly('✅ Update Existing Loan');
        
        Logger.silly('Checking Existing Loan Status');
        if(loanData.status.toUpperCase()==='APPROVED'){
            throw Error('loan:Loan has been approved. Cannot be updated now');
        }

        if(String(username).substr(0,2).toUpperCase()!=='AG'){
            throw Error('loan:Agent Access Only')
        }

        Logger.silly('Calculating age with tenure period');
        const user = await User.findOne({"username":loanData.customerUsername});

        if(!user){
            throw Error('loan:Unable to fetch user. Loan updation failed');
        }

        const age = (new Date().getFullYear())-parseInt(user.DOB.split('-')[2]);
        if( (age+(tenure/12)) > 70){
            return `Loan cannot be updated as age and tenure period exceeds 70`;
        }

        Logger.silly('Checking cibil score of user');
        if(user.cibilScore<500){
            return `Loan cannot be updated as current cibil score is <500`;
        }

        Logger.silly('Calculating Minimum Loan Amount');
        const loanVal = generateMinimumLoan(tenure, interestPerMonth);

        if(!loanVal){
            throw Error(`loan:Loan value calculation exceeds our policy, max loan provided is 40Lakhs`);
        }

        Logger.silly('Compairing All EMIs');
        const createOrReject = await compareAllEMIs(loanVal.emi,user.netMonthlySalary,age,user.username,loanData.loanId);

        if(!createOrReject){
            throw Error('loan:Not Eligible As Per Our Policies');
        }

        Logger.silly('Updating Loan Object');
        const loan = await Loan.updateOne({"loanId":loanData.loanId},{
            "status":'NEW',
            "minLoanAmount":loanVal.maxPossibleLoanAmount,
            "interestPerMonth":loanVal.interestPerMonth,
            "tenure":tenure,
            "emi":loanVal.emi,
            "rateOfInterest":loanVal.rateOfInterest,
            "totalLoanAmount":loanVal.principalAmount,
            "totalInterestApplied":loanVal.totalInterestCharged,
        });

        if(!loan){
            throw Error('loan:Loan Updation Failed');
        }

     } catch (e) {
        Logger.debug('src/services/loan/updateLoan');
        throw e;         
     }
 }



 /**
  * This function is called to return the filtered 
  * data from DB
  * 
  * @param {*} username : username of customer only
  * @param {*} status : status of loan 
  * @param {*} criteria : creation or updation
  * @param {*} sort : asc or desc
  */
 const filterLoanDetails = async(username,status,criteria,sort,currUsername)=>{
    try {

        Logger.silly('✅ Filter Loan Service Called');
        
        username.toUpperCase();
        status.toUpperCase();
        criteria.toUpperCase();
        sort.toUpperCase();
        currUsername.toUpperCase();

        Logger.silly('Confirming User');
        if(username!=='ALLUSERS' && String(username).substr(0,2).toUpperCase()!=='CU'){
            throw Error(`loan:Search available only for customer's details`);
        }
        
        if(username!=='ALLUSERS' && String(currUsername).substr(0,2).toUpperCase()==='CU'  && currUsername.toUpperCase()!==username.toUpperCase()){
            throw Error('loan:Access Forbidden');
        }

        Logger.silly('Fetching Loan(s) Data');
        let loans;

        const sortBy = (sort==='ASC')?(1):(-1);

        // when the user detching data is either admin or agent
        if(username==='ALLUSERS'){
            if(status==='ALL'){
                if(criteria==='CREATION')
                    loans = await Loan.find({}).sort({"createdAt":sortBy})
                else
                    loans = await Loan.find({}).sort({"updatedAt":sortBy})
            }
            else{
                if(criteria==='CREATION')
                    loans = await Loan.find({"status":status.toUpperCase()}).sort({"createdAt":sortBy})
                else
                    loans = await Loan.find({"status":status.toUpperCase()}).sort({"updatedAt":sortBy})                
            }
        }

        else{
            if(status==='ALL'){
                if(criteria==='CREATION')
                    loans = await Loan.find({"customerUsername":username}).sort({"createdAt":sortBy})
                else
                    loans = await Loan.find({"customerUsername":username}).sort({"updatedAt":sortBy})
            }
            else{
                if(criteria==='CREATION')
                    loans = await Loan.find({"customerUsername":username,"status":status.toUpperCase()}).sort({"createdAt":sortBy})
                else
                    loans = await Loan.find({"customerUsername":username,"status":status.toUpperCase()}).sort({"updatedAt":sortBy})                
            }            
        }
        // when user fetching data is one from admin,agent or customer
        // and 
        if(!loans){
            throw Error('loan:Unable to fetch filtered loan details')
        }

        return loans;
    } catch (e) {
        Logger.debug('src/services/loan/filterLoanDeatils');
        throw e;               
    }
 }
 /**
  * This function allows updating loan status
  * 
  * @param {*} loanData : loan details
  */
 const loanStatusChange = async(loanData,status,username)=>{
     try {
        Logger.silly('✅ Loan Status Change Service Called');

        Logger.silly('Checking Loan Status');
        if(loanData.status.toUpperCase()==='APPROVED'){
            throw Error('loan:Loan has been APPROVED. Cannot be updated now');
        }   
        
        if(String(username).substr(0,2).toUpperCase()!=='AD'){            
            throw Error('loan:Administrator Access Only')
        }

        Logger.silly('Updating Loan Status');
        const loan = await Loan.updateOne({"loanId":loanData.loanId},{"status":status.toUpperCase()});

        if(!loan){
            throw Error('loan:Loan Updation Failed');
        }
        
     } catch (e) {
        Logger.debug('src/services/loan/loanStatusChange');
        throw e;                  
     }
 }



 /**
  * This function compares all previous emis and caluclates
  * new total emi that the user may have to pay
  * If it excceds the approximate savings, the updation 
  * or cretion fails
  * 
  * @param {*} newEMI : newly creating or updating loan's generted EMI
  * @param {*} netMonthlySalary : user's net monthly salary
  * @param {*} age : customer's age
  * @param {*} customerUsername : customer's username
  * @param {*} recLoanId : received LoanId ,mainly for Updation
  */
 async function compareAllEMIs(newEMI,netMonthlySalary, age, customerUsername,recLoanId){
    Logger.silly('✅ Compairing EMIs to check for eligibilty of loan');

    // age (21-40): 30% of netMonthlySalary
    // age (41-60): 20% of netMonthlySalary
    // age (61-70): 10% of netMonthlySalary
    let approxSaving = 0;
    if(age>=21 && age<=40){
        approxSaving = netMonthlySalary*0.3;
    }
    else if(age>=41 && age<=60){
        approxSaving = netMonthlySalary*0.2;
    }
    else{
        approxSaving = netMonthlySalary*0.1;
    }

    Logger.silly('Fetching All previous Loans of the user');
    const loans = await Loan.find({"customerUsername":customerUsername});

    if(loans.length===0){
        return newEMI;
    }
    else if(!loans){
        return null;
    }

    Logger.silly('Calculating Previous EMIs');
    let totalEMI = 0;
    loans.forEach(loan=>{
        if(loan.loanId.toString()!==recLoanId.toString() && loan.status==='APPROVED')
            totalEMI+=loan.emi;
    });

    totalEMI+=newEMI;

    // Logger.warn(`
    //     totalEMI: ${totalEMI}
    //     approxSa : ${approxSaving}
    // `)
    Logger.silly('Compairing totalEMIs with approximate savings');
    if(totalEMI>approxSaving){
        return null;
    }

    return totalEMI;
 }



/**
 * Generate Minimum Loan
 * 
 * @param {*} Duration 
 * @param {*} ChargesPerMonth 
 */
 function generateMinimumLoan(Duration, ChargesPerMonth){
    Logger.silly('✅ Generating Minimum Loan @ 20% of PrincipalAmount');

    const maxPossibleLoanAmount = ChargesPerMonth*Duration;
    let rateOfInterest = 1;

    // if 'maxPossibleLoanAmount' is less than 5 lakh
    if(maxPossibleLoanAmount>0 && maxPossibleLoanAmount<=500000){
        rateOfInterest = 9.05;
    } // if 'maxPossibleLoanAmount' is less than 10 lakh
    else if(maxPossibleLoanAmount>500000 && maxPossibleLoanAmount<=1000000){
        rateOfInterest = 10.50;
    }// if 'maxPossibleLoanAmount' is less than 15 lakh
    else if(maxPossibleLoanAmount>1000000 && maxPossibleLoanAmount<=1500000){
        rateOfInterest = 11.49;
    }// if 'maxPossibleLoanAmount' is less than 40 lakh
    else if(maxPossibleLoanAmount>1500000 && maxPossibleLoanAmount<=4520000){
        rateOfInterest = 12.99;
    }// can't generate more loan
    else{
        return null;
    }

    Logger.silly('Calculating Min Loan');
    const onePlusRtoN = parseFloat(Math.pow( (1+(rateOfInterest/12/100)) ,Duration).toFixed(4));

    Logger.silly('Calculating EMI');
    const emi =  Math.floor((maxPossibleLoanAmount * (rateOfInterest/12/100) * onePlusRtoN) / (onePlusRtoN-1)) ;

    const principalAmount = emi*Duration;
    const interestPerMonth = (principalAmount-maxPossibleLoanAmount)/Duration;
    
    const totalInterestCharged = (principalAmount-maxPossibleLoanAmount);
    // Logger.warn(`
    //     maxPossible: ${maxPossibleLoanAmount}
    //     principal: ${principalAmount}
    //     emi: ${emi}
    //     IPM: ${interestPerMonth}
    //     tIC: ${totalInterestCharged}
    // `)
    
    return {principalAmount,rateOfInterest,emi,interestPerMonth,maxPossibleLoanAmount,totalInterestCharged}
}


 /**************** MODULE EXPORTS **************/
 module.exports = {
    createMinimumLoan,
    updateLoan,
    loanStatusChange,
    filterLoanDetails
 }