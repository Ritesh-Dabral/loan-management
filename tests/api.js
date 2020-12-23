/**
 * API http testing
 */

 const request = require('supertest');
 const express = require('express');
 const Loaders = require('../src/Loaders/index');
 const User    = require('../src/models/user');
 const Loan    = require('../src/models/loan');
 const mongoose = require('mongoose');

 const apiTest = ()=>{
    const app = express();
    let superadmin={
        AccessToken:'',
    }
    let admin={
        AccessToken:'',
        username:'',
        password:''
    }
    let agent={
        AccessToken:'',
        username:'',
        password:''
    }
    let custToken={
        AccessToken:'',
        username:'',
        password:''
    }

    beforeAll(async()=>{
        await Loaders(app);
        const options = { 
            useNewUrlParser: true,
            useUnifiedTopology: true, 
            useFindAndModify: false,
            useCreateIndex: true 
        }
        await mongoose.connect(process.env.TESTDB_URI,options);
    })

    /**
     * Authentication Routes
     */
    describe('✅ Auth Routes :', ()=>{

        it('POST /api/authh/setsuperadmin : Status 201 (Created)', (done)=>{
            request(app).post('/api/auth/setsuperadmin')
                .expect(201)
                .end(function(err, res) {
                    superadmin.AccessToken = res.body.token;
                    done();
                });
        })

        it('POST /api/auth/createUser : Status 201 (created)', (done)=>{
            request(app).post('/api/auth/createUser')
                .set('Authorization', `Token ${superadmin.AccessToken}`)
                .send({
                    "email":"urlsrty@gmail.com",
                    "phoneNumber":"7777122926",
                    "netMonthlySalary":260000,
                    "firstName":"bruce",
                    "lastName":" dwane  ",
                    "DOB":"29-02-1996"
                })
                .expect(201,done)
        })

        it('POST /api/auth/createUser : Status 401 (unauthorized)', (done)=>{
            request(app).post('/api/auth/createUser')
                .set('Authorization', `Token ${superadmin.AccessToken}+-x`)
                .send({
                    "email":"xyz@gmail.com",
                    "phoneNumber":"7777122928",
                    "netMonthlySalary":260000,
                    "firstName":"bruce",
                    "lastName":" dwane  ",
                    "DOB":"29-02-1996"
                })
                .expect(401,done)
        })

        it('POST /api/auth/login : Status 200 (OK)', (done)=>{
            request(app).post('/api/auth/login')
                .set('Authorization', 'Token ')
                .send({
                    "username":" SA123456 ",
                    "password":"SA1234567"
                })
                .expect(200,done);
        })
    })



    describe('✅ Loan Routes :', () => {

        it('POST /api/loan/create : Status 401 (Unauthorized)', async()=>{
            await request(app).post('/api/loan/create')
            .set('Authorization', `Token ${superadmin.AccessToken}`)
            .send({
                "tenure":20,
                "interestPerMonth": 700,
                "username":"CU122926"
            })
            .expect(401)  
        })

        it('POST /api/loan/edit/:loanId : Status 404 (Not Found)', async()=>{
            await request(app).post('/api/loan/edit/LO123456789012')
            .set('Authorization', `Token ${superadmin.AccessToken}`)
            .send({
                "tenure":39,
                "interestPerMonth": 700
            })
            .expect(404)  
        })

        it('PUT /api/loan/approval/:loanId : Status 404 (Not Found)', async()=>{
            await request(app).post('/api/loan/approval/LO123456789012')
            .set('Authorization', `Token ${superadmin.AccessToken}`)
            .expect(404)  
        })

        it('PUT /view/:username/:status/:criteria/:sort : Status 404 (Not Found)', async()=>{
            await request(app).post('/api/loan/view/allusers/all/creation/asc')
            .set('Authorization', `Token ${superadmin.AccessToken}`)
            .expect(404)  
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
 };




 /********** MODULE EXPORTS*******/

 module.exports = apiTest;