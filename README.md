__**There's a [documentation](#documentation) for this project included at the end of this file.__

# DEEL BACKEND TASK

💫 Welcome! 🎉


This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile
A profile can be either a `client` or a `contractor`. 
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract
A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job
contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

  
The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

  

1. Start by cloning this repository.

  

1. In the repo root directory, run `npm install` to gather all dependencies.

  

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

  

1. Then run `npm start` which should start both the server and the React client.

  

❗️ **Make sure you commit all changes to the master branch!**

  
  

## Technical Notes

  

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

  

## APIs To Implement 

  

Below is a list of the required API's for the application.

  


1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.

1. ***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. ***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. ***GET*** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

  

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

  

## Submitting the Assignment

When you have finished the assignment, create a github repository and send us the link.

  

Thank you and good luck! 🙏

# Documentation

- [Installation](#installation)
- [Backend](#backend)
- [Frontend](#frontend)
- [Testing](#testing)

## Installation

Only running `npm install` is necessary. For starting the project, `npm start` will run both the client and the server.
## Backend

### Contributions 

- Implemented the API routes described above.
- Put focus on performance and scalability, i.e. created indexes, used transactions where necessary (for the job payment), made sure wherever possible the operations were done on the database level instead of on the application level, used concurrency where possible and various other optimizations. 
- Implemented validations (using Joi) for every route.
- Converted the project to TypeScript. 

📦src  
 ┣ 📂[middleware](#middleware)  
 ┃ ┣ 📜errorHandler.ts  
 ┃ ┗ 📜getProfile.ts  
 ┣ 📂[modules](#modules)  
 ┃ ┣ 📜admin.ts  
 ┃ ┣ 📜balances.ts  
 ┃ ┣ 📜contracts.ts  
 ┃ ┣ 📜index.ts  
 ┃ ┣ 📜jobs.ts  
 ┃ ┗ 📜profile.ts  
 ┣ 📂[types](#types)  
 ┃ ┗ 📜global.d.ts  
 ┣ 📜app.ts  
 ┣ 📜[model.ts](#models)  
 ┣ 📜server.ts  
 ┗ 📜[utils.ts](#utils)

### Middleware

A new middleware called `errorHandler` was created for graceful error handling. If the error was intended to be shown in the client (i.e. a `DeelError` was thrown), then the response will have the relevant status code and the error message, otherwise the response will be a generic _500 Internal Server Error_ and the error will be logged to the console with the timestamp.

### Modules

Routes have been split into files inside the `src/modules` folder based on the base path, i.e. `/admin` is in `src/modules/admin.ts`, etc. Each files contains an Express Router that also uses the middleware `getProfile` where applicable (everywhere except for the `/admin` route).

### Types

A global TypeScript declaration file was created for augmenting the `Express.Request` interface to include the `profile` property.

### Models

The `id` property had to be specifically added to each model as a result of the conversion to TypeScript.


### Utils

The `utils.ts` file contains the class for the custom error used throughout the application, called `DeelError`, a function called `requestWrapper` used for removing the boilerplate out of the request processing logic and for processing the errors thrown. There are some other implementation specific utility functions in this file as well.

## Frontend

The frontend is a React application that uses the [React Query](https://www.npmjs.com/package/react-query) library for fetching, caching and updating the data. I have used [Tailwind CSS](https://tailwindcss.com/) for styling, but I haven't focused too much on this aspect, so don't be too harsh about it 🙏.

You can use the number input at the top right of the page to change the current profile id. The balance is shown in the top right as well and there's a `Deposit` button that will open a modal with a range slider for the amount to deposit (the slider also has a max value of 25% of the total amount of unpaid jobs).

There are also 3 tables featured on the page:

1. The `Contracts` table shows all the contracts for the current profile.
2. The `Unpaid Jobs` table shows all the unpaid jobs for the current profile, with the ability (only for clients) to pay for the jobs.
3. The `Best Clients` table implements the API call for the `/admin/best-clients` route and also has 3 inputs for the start and end dates and a limit input for the number of clients to return.

## Testing

The tests can be run using `npm test`.

I have used [Jest](https://jestjs.io/) and [Supertest](https://www.npmjs.com/package/supertest) for writing integration tests for the API.

All the tests are in the `src/test` folder and follow the same file structure as the `src/modules` folder. There is also a `globalSetup.ts` file that is run before all the tests to reset the database to the values provided by the seed function.

Every required route was tested and various scenarios were considered, including:
- Invalid input (invalid dates, invalid amounts, etc.)
- Testing for failure and asserting the error message and status code.
- Testing for success and checking that the response is correct.