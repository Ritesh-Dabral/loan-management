
# `loan-management`
Application to create users based on the user type or administrative power and loan generation, updation, EMI calculations and acceptance or rejection based on various factors. 

## Requirements
  * NodeJS (curr ver - 12)
  * MongoDB (if running locally)
  * Postman (to test the APIs)
  * Access to a valid mail

## Scripts
The project consists of well written and easily understandable test cases and descriptions.
#### `npm start`
- This starts the project in development mode
#### `npm test -- cumulative.test.js`
- This starts the automated Unit and Integrated Testings 

## Important
* Make sure to fill the *.env* file with your *own keys*

## Steps
1. run command `git clone https://github.com/Ritesh-Dabral/loan-management.git`
2. Within the root directory, run command `npm install`
3. Make sure to include environment file along with your API KEYs
4. Run the tests to make sure everything is working fine
5. If all test cases passed, run command `npm start` from root directory

## What does the application do?
- The application is responsible for creating new Admins, Agents or Customers and loans.
- Loan can be applied only for the customers and only by the agents.
- Loan's status i.e 'Accepted' or 'Rejected' can be changed only by the admins.
- Customer cannot create another user.
- All loans of a single or multiple customers can be seen only by the agents or admins based on various filtering criteria like 'loan status' , 'creation date', 'recent updation' etc.
- A customer can see only his/her loans.
- CIBIL score is auto generated b/w 300-900
- Loan application is generated for users having monthly salary >= 25k and age b/w 21-70
- Finally, loan generation is based on user's current age, previous EMIs, monthly net salary's some part based on age and interest amount to be applied on it as per the algo.
