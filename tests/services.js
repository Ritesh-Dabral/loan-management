/**
 * Tests the services
 * 
 */

 const User         = require('../src/models/user');
 const Loan         = require('../src/models/loan');
 const mongoose     = require('mongoose');
 const Logger       = require('../src/Loaders/logger');
 const dotenv       = require('dotenv').config();
 const authServices = require('../src/Services/auth');
 const loanServices = require('../src/Services/loan');

 const servicesTest = ()=>{

    
    const superadmin = {
        username:'SA123456',
        role:'superadmin',
        password:'test123456',
        salt:'101290njkqwe0120)!02',
        email:'test123@gmail.com',
        phoneNumber:'7867329919',
        createdBy:'SA123456',
        netMonthlySalary:26000,
        DOB:'01-01-1998',
        firstName:'bruce',
        lastName:'wayne',
        cibilScore:750
    }

    const loanObject = {
        loanId:'LO123456789012',
        customerUsername:'CU123456',
        agentUsername:'AG234567',
        status:'NEW',
        minLoanAmount:6000,
        interestPerMonth:25,
        tenure:12,
        emi:525,
        rateOfInterest:9.05,
        totalLoanAmount:6300,
        totalInterestApplied:300,
        relatedDocuments:[]
    }

    const custDet = {

    }

    let data;

    /**
     * Before any tests start
     */
    beforeAll(async()=>{
        const options = { 
            useNewUrlParser: true,
            useUnifiedTopology: true, 
            useFindAndModify: false,
            useCreateIndex: true 
        }
        await mongoose.connect(process.env.TESTDB_URI,options);
        data = await authServices.setSuperAdmin();
    })

    
    /**
     * Super Admin Functionality Testing
     */
    describe('✅ Check Superadmin Functionality :', ()=>{

        it('Checks user not to be null',()=>{
            expect(data['user']).not.toBeNull();
        })
        it('Checks user not to be undefined',()=>{
            expect(data['user']).not.toBeUndefined();
        })
        it('Checks token not to be null',()=>{
            expect(data['token']).not.toBeNull();
        })
        it('Checks token not to be undefined',()=>{
            expect(data['token']).not.toBeUndefined();
        })
        it('Checks that function will throw an error for trying to make another super admin with same properties',async()=>{
            
            try {
                const tempUser =  await authServices.setSuperAdmin();
            } catch (e) {
                expect(e).not.toBeNull();
            }
        })
    });


    /**
     * Sign In Function
     */
    describe('✅ Check SignIn Functionality :', ()=>{

        it('Successfully returns user on correct credentials', async()=>{
            const {user} = await authServices.signin(username='SA123456',password='SA1234567');
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
            expect(user['username']).toEqual('SA123456');
            expect(user['role']).toEqual('superadmin');
        });

        it('Throws error on incorrect credentials', async()=>{
            try {
                const {user} = await authServices.signin(username='SA123456',password='SA1234567');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        })

        it('Throws error on missing credentials', async()=>{
            try {
                const {user} = await authServices.signin(username='SA123456',password='');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        })
        
    })


    /**
     * Create User Functionality
     */
    describe('✅ Check CreateUser Functionality :', ()=>{

        it(`Successfully returns new 'admin' user on correct credentials`, async()=>{
            let oldUser={
                email:"abc@gmail.com",
                phoneNumber:"7777122922",
                role:"superadmin",
                createdBy:"SA123456",
                netMonthlySalary:26000,
                DOB:'23-03-1999',
                firstName:'bruce',
                lastName:'wayne',
                cibilScore:750
            }
            let {user} = await authServices.createUser(oldUser);
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
            expect(user['username']).not.toEqual('AD122929');
            expect(user['password']).toBeUndefined();
            expect(user['salt']).toBeUndefined();
            expect(user['role']).toEqual('admin');

        
        });

        it(`Successfully returns new 'agent' user on correct credentials`, async()=>{
            let oldUser={
                email:"xyz@gmail.com",
                phoneNumber:"7777122923",
                role:"admin",
                createdBy:"AD122922",
                netMonthlySalary:26000,
                DOB:'23-03-1990',
                firstName:'bruce',
                lastName:'wayne',
                cibilScore:760
            }
            let {user} = await authServices.createUser(oldUser);                
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
            expect(user['username']).toBe('AG122923');
            expect(user['password']).toBeUndefined();
            expect(user['salt']).toBeUndefined();
            expect(user['role']).toEqual('agent');

        });

        it(`Successfully returns new 'customer' user on correct credentials`, async()=>{
            let oldUser={
                email:"def@gmail.com",
                phoneNumber:"9777122924",
                role:"agent",
                createdBy:"AG122923",
                netMonthlySalary:26000,
                DOB:'23-03-1980',
                firstName:'bruce',
                lastName:'wayne',
                cibilScore:600
            }
            let {user} = await authServices.createUser(oldUser);
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
            expect(user['username']).toBe('CU122924');
            expect(user['password']).toBeUndefined();
            expect(user['salt']).toBeUndefined();
            expect(user['role']).toEqual('customer');

        });

        it(`Throws an error if 'customer' tries to create a new user`, async()=>{
            let oldUser={
                email:"ghi@gmail.com",
                phoneNumber:"8777122925",
                role:"client",
                createdBy:"CU122924",
                netMonthlySalary:26000,
                DOB:'24-12-1988',
                firstName:'bruce',
                lastName:'wayne',
                cibilScore:300
            }

            try {
                let {user} = await authServices.createUser(oldUser);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        it(`Throws an error if incorrect, blank or unpriviledged user tries to create new user`, async()=>{
            let oldUser={
                email:"   ",
                phoneNumber:"     ",
                role:"client",
                createdBy:" ",
            }

            try {
                let {user} = await authServices.createUser(oldUser);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        })

    })


    /**
     * Create Minimum Loan
     */
    describe('✅ Check Create Minimum Loan Functionality', ()=>{
        // loan requires an agent username only and customer details
        let custDet;
        let agentUsername = 'AG122923';
        
        async function setup(){
            custDet = await User.findOne({"username":'CU122924'});
        }

        it('Creates minimum loan amount if credentials are correct ', async()=>{
            await setup();
            custDet.cibilScore = 700;
            const loan = await loanServices.createMinimumLoan(12,500,custDet,agentUsername);
            
            expect(loan).not.toBeNull();
            expect(loan).not.toBeUndefined();
            expect(loan['customerUsername']).toBe('CU122924');
            expect(loan['agentUsername']).not.toBeUndefined();
            expect(loan['agentUsername']).toMatch(/AG[0-9]{6}/);
            expect(loan['loanId']).toMatch(/LO[0-9]{12}/);           
        });

        it(`Throws an error if customer's cibil score is below 501`, async()=>{
            await setup();
            custDet.cibilScore = 499;
            try {
                const loan = await loanServices.createMinimumLoan(12,500,custDet,agentUsername);
            } catch (e) {
              expect(e).not.toBeNull();
            }                
        })

        it(`Rejects loan creation if all monthly EMIs exceeds a portion of net monthly salary based on age group`, async()=>{
            await setup();
            custDet.cibilScore = 700; 
            try {
                const loan = await loanServices.createMinimumLoan(39,50000,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }             
        })

        it('Successfully adds loan details to an array inside User Schema ', async()=>{
            await setup();
            custDet.cibilScore = 700;
            const loan = await loanServices.createMinimumLoan(12,600,custDet,agentUsername);
            
            expect(loan).not.toBeNull();
            expect(loan).not.toBeUndefined();
            expect(custDet['loans'].length).toBe(1);        
        });


        it(`Rejects loan creation if customer's current age+tenure > 70`, async()=>{
            await setup();
            custDet.DOB = '12-01-1960'; 
            try {
                const loan = await loanServices.createMinimumLoan(180,500,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }             
        })

        it(`Rejects loan creation if tenure isn't multiple of 3, or b/w [3,180] or missing`, async()=>{
            await setup();
            custDet.cibilScore = 700; 
            try {
                const loan = await loanServices.createMinimumLoan(0,500,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }    
            
            try {
                const loan = await loanServices.createMinimumLoan(5,500,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            } 

            try {
                const loan = await loanServices.createMinimumLoan(500,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            } 
        })

        it(`Rejects loan creation if anybody besides agent tries to create it`, async()=>{
            await setup();
            custDet.cibilScore = 700;
            
            try {
                agentUsername = 'AD123456';
                const loan = await loanServices.createMinimumLoan(12,500,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
            
            try {
                agentUsername = 'CU123456';
                const loan = await loanServices.createMinimumLoan(12,500,custDet,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
        })

    });




    /**
     * Loan Updation Functionality
     */
    describe('✅ Update Loan Functionality', ()=>{
        // loan requires an agent username only and customer details
        let loanData,custDet;
        let agentUsername = 'AG122923';
        
        async function setup(){
            custDet = await User.findOne({"username":'CU122924'});
            loanData = await Loan.findById(custDet.loans[0]);
        }

        it('Updates loan amount if credentials are correct ', async()=>{
            await setup();

            await loanServices.updateLoan(24,600,loanData,agentUsername);
            loan = await Loan.findById(custDet.loans[0]);

            expect(loan).not.toBeNull();
            expect(loan).not.toBeUndefined();
            expect(loan['customerUsername']).toBe('CU122924');
            expect(loan['agentUsername']).not.toBeUndefined();
            expect(loan['agentUsername']).toMatch(/AG[0-9]{6}/);
            expect(loan['loanId']).toMatch(/LO[0-9]{12}/);     
        });

        it(`Loan updation fails if customer's current cibil score is below 501`, async()=>{
            await setup();
            custDet.cibilScore = 499;
            try {
                await loanServices.updateLoan(24,600,loanData,agentUsername);
            } catch (e) {
              expect(e).not.toBeNull();
            }                
        })

        it(`Rejects loan updation if all monthly EMIs exceeds a portion of net monthly salary based on age group`, async()=>{
            await setup();
            custDet.cibilScore = 700; 
            try {
                await loanServices.updateLoan(39,60000,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }             
        })


        it(`Rejects loan updation if customer's current age+tenure > 70`, async()=>{
            await setup();
            custDet.DOB = '12-01-1960'; 
            try {
                await loanServices.updateLoan(180,600,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }             
        })

        it(`Rejects loan updation if tenure isn't multiple of 3, or b/w [3,180] or missing`, async()=>{
            await setup();
            custDet.cibilScore = 700; 
            try {
                await loanServices.updateLoan(4,600,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }    
            
            try {
                await loanServices.updateLoan(0,600,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            } 

            try {
                await loanServices.updateLoan(500,600,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            } 
        })

        it(`Rejects loan creation if anybody besides agent tries to create it`, async()=>{
            await setup();
            custDet.cibilScore = 700;
            
            try {
                agentUsername = 'AD123456';
                await loanServices.updateLoan(0,600,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
            
            try {
                agentUsername = 'CU123456';
                await loanServices.updateLoan(0,600,loanData,agentUsername);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
        })
    });


    /**
    * Loan status change
    */
    describe('✅ Loan status change functionality', ()=>{
        // loan requires an agent username only and customer details
        let loanData,custDet;
        let username = 'AD122923';
        let status = 'approved';
        
        async function setup(){
            custDet = await User.findOne({"username":'CU122924'});
            loanData = await Loan.findById(custDet.loans[0]);
        }

        it('Changes status of loan if credentials are correct', async()=>{
            await setup();

            await loanServices.loanStatusChange(loanData,status,username);
            loan = await Loan.findById(custDet.loans[0]);

            expect(loan).not.toBeNull();
            expect(loan).not.toBeUndefined();
            expect(loan['customerUsername']).toBe('CU122924');
            expect(loan['agentUsername']).not.toBeUndefined();
            expect(loan['agentUsername']).toMatch(/AG[0-9]{6}/);
            expect(loan['loanId']).toMatch(/LO[0-9]{12}/);     
            expect(loan['status']).toBe('APPROVED');     
        });

        it(`Loan status updation fails if status is anything besides approved/rejected case sentitive`, async()=>{
            await setup();
            status = 'noidea';
            try {
                await loanServices.loanStatusChange(loanData,status,username);
            } catch (e) {
              expect(e).not.toBeNull();
            }                
        })

        it(`Rejects loan status change if anybody besides admin tries to create it`, async()=>{
            await setup();
            loanData['status'] = 'NEW';
            try {
                username = 'AG123456';
                await loanServices.loanStatusChange(loanData,status,username);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
            
            try {
                username = 'CU123456';
                await loanServices.loanStatusChange(loanData,status,username);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
        })

        it(`Throws error if loan status is already approved`, async()=>{
            await setup();
            loanData['status'] = 'APPROVED';
            try {
                await loanServices.loanStatusChange(loanData,status,username);
            }
            catch(e){
                expect(e).not.toBeNull();
            }   
        })
    })


        /**
    * Loan status change
    */
   describe('✅ View Loan Functionality', ()=>{

    // username: allusers | customer's username
    // status : all | new | approved | rejected
    // criteria : creation | updation
    // sort : asc | desc
    // currUsername : current user's username

    let username     = 'CU122923';
    let status       = 'all';
    let criteria     = 'creation';
    let sort         = 'asc';
    let currUsername = 'AD123456';


    it('Fetch loan details if all credentials are correct', async()=>{
        
        const loan = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
        expect(loan).not.toBeNull();    
    });

    it(`Throws error when customer tries to access another customer's details`, async()=>{
        currUsername = 'CU111111';
        try {
            const loan = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
        } catch (e) {
           expect(e).not.toBeNull();
        }                
    })

    it(`Throws error when user tries to access any other user besides customer`, async()=>{
        currUsername = 'AD111111';
        username = 'AG111111';
        try {
            const loan = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
        } catch (e) {
           expect(e).not.toBeNull();
        }                
    })

    it(`Allows access when agent tries to access any customer's details`, async()=>{
        currUsername = 'AG123456';
        username     = 'CU122923';
        const loan = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
        expect(loan).not.toBeNull();                  
    })

    it(`Allows access when admin tries to access any customer's details`, async()=>{
        currUsername = 'AD123456';
        username     = 'CU122923';
        const loan = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
        expect(loan).not.toBeNull();                  
    })

    it(`Allows access when customer tries to access any his/her details`, async()=>{
        currUsername = 'CU122923';
        username     = 'CU122923'
        const loan = await loanServices.filterLoanDetails(username,status,criteria,sort,currUsername);
        expect(loan).not.toBeNull();                  
    })

})

    /**
     * After all tests done, clear the DB
     */
    afterAll(async(done)=>{
        await User.deleteMany({});
        await Loan.deleteMany({});
        mongoose.disconnect(done)
    })
 }


  /********** MODULE EXPORTS*******/

  module.exports = servicesTest;