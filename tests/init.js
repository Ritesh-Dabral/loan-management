/**
 * Simple test to check if jest is working
 */

 const initTest =() =>{
    it('Adds 2+2 to give 4', ()=>{
        expect(2+2).toBe(4);
    })
 }

  /********** MODULE EXPORTS*******/

  module.exports = initTest;