/**
 * All tests regarding 'Loaders'
 */

 const mongooseLoader = require('../src/Loaders/mongoose');
 const expressLoader = require('../src/Loaders/express');

 const app = require('express')();


 const loadersTest = ()=>{

    /**
     * Mongoose Loader returns true if connected 
     * successfully, else throws an error
     */

     it('Check Mongoose Loader', async ()=>{
        const db = await mongooseLoader();

        expect(db).toBeTruthy();
        expect(db).not.toBeNull();
     });

     it('Check Express Loader', async ()=>{
        const express = expressLoader(app);

        expect(express).toBeTruthy();
     });


 };


  /********** MODULE EXPORTS*******/

  module.exports = loadersTest;