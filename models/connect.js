const dotenv = require('dotenv');
// const sql = require('mssql');


dotenv.config();

const user = process.env.USER
const password = process.env.PASSWORD
const database = process.env.DATABASE
const server = process.env.SERVER


var config = {
    server: 'DESKTOP-0SJRFLM\\SQLEXP',  //update me
    requestTimeout: 500000,
    authentication: {
        type: 'default',
        options: {
            userName: 'sa', //update me
            password: 'Vmartx1551'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        trustServerCertificate: false,
        database: database  //update me
    }
};

module.exports=config;