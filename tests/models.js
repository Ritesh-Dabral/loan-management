
const User  = require('../src/models/user');
const Loan  = require('../src/models/loan');
const mongoose = require('mongoose');
const Logger = require('../src/Loaders/logger');
const dotenv  = require('dotenv').config();


const newUser = {
    username:'SA123456',
    role:'admin',
    password:'test123456',
    salt:'101290njkqwe0120)!02',
    email:'test123@gmail.com',
    phoneNumber:'7867329919',
    createdBy:'SA123456',
    netMonthlySalary:26000,
    DOB:'01-01-1993',
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


const modelsTest = ()=>{
    beforeAll(async()=>{
        const options = { 
            useNewUrlParser: true,
            useUnifiedTopology: true, 
            useFindAndModify: false,
            useCreateIndex: true 
        }
        await mongoose.connect(process.env.TESTDB_URI,options);
    });


    describe('✅ User Schema :', ()=>{
        it('Should save user', async()=>{
            const user = await User.create(newUser);
    
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
        });
    
        it(`Should fetch user with username='SA123456'`, async()=>{
            const user = await User.findOne({"username":'SA123456'});
    
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
        });
    
        it('Should show an error for duplicate value input', async()=>{
            try {
                const user = await User.create(newUser);
            } catch (e) {
                expect(e.message.split(' ')[0]).toBe('E11000');   
            }
        });
    
        it('Should show an error for invalid email input', async()=>{
    
            const invalidEmail = {
                ...newUser,
                email:'123'
            }
            try {
                const user = await User.create(invalidEmail);
            } catch (e) {
                expect(e.message.split(':')[2]).toBe(' Invalid email, try again');   
            }
    
        });
    
        it('Should show an error for invalid phone input (/^[789]{1}[0-9]{9}$/)', async()=>{
    
            const invalidPhone = {
                ...newUser,
                phoneNumber:'82344567899'
            }
            try {
                const user = await User.create(invalidPhone);
            } catch (e) {
                expect(e.message.split(':')[2]).toBe(' Invalid Phone Number');   
            }
        });
    
        it('Should throw an error for any blank, incorrect or duplicate properties', async()=>{
            const invalidInput = {
                ...newUser,
                username:' '
            }
    
            try {
                const user = await User.create(invalidInput);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });


    describe('✅ Loan Schema :', ()=>{

        it('Should create a new loan object', async()=>{
            const loan = await Loan.create(loanObject);
    
            expect(loan).not.toBeNull();
            expect(loan).not.toBeUndefined();
            expect(loan['status']).toEqual('NEW');
            expect(loan.loanId.length).toBe(14);
        });

        it(`Should fetch loan object with loanId='LO123456789012'`, async()=>{
            const loan = await Loan.findOne({"loanId":'LO123456789012'});
    
            expect(loan).not.toBeNull();
            expect(loan).not.toBeUndefined();
            expect(loan.loanId.length).toBe(14);
            expect(loan['customerUsername']).toEqual('CU123456');
        });

        it('Should throw an error for duplicate value of loanId', async()=>{
            try {
                const loan = await Loan.create(loanObject);
            } catch (e) {
                expect(e.message.split(' ')[0]).toBe('E11000');   
            }
        });

        it('Should throw an error for any blank, incorrect or duplicate properties', async()=>{
            const invalidInput = {
                ...loanObject,
                loanId:'LA123443211234',
                agentUsername:'AD123456'
            }
    
            try {
                const loan = await Loan.create(invalidInput);
            } catch (e) {
                expect(e).not.toBeNull();
            }
    
        });

    });
    afterAll(async(done)=>{
        await User.deleteMany({});
        await Loan.deleteMany({});
        mongoose.disconnect(done)
    });
}

  /********** MODULE EXPORTS*******/

  module.exports = modelsTest;