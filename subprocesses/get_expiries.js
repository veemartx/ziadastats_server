const sql = require('mssql')
const fs = require('fs');
const config = require('../models/connect');
const axios = require('axios');


sql.on('error', err => {
    // ... error handler
    console.log(err);
})


var database = process.argv[2];

var branch =  process.argv[3];


function handleBranchInventory(config) {
    sql.connect(config)
        .then(function () {
            return sql.query(`
            USE [${database}];
            
            EXEC qrystockexpiry @EndDate='2300-12-31'`)
        })
        .then(function (recordset) {
            sql.close();

            postZiadaLiteData(branch, recordset['recordset'],database);

        })
        .catch(function (err) {
            sql.close();
            throw err; // it can be done so that you can handle the errors in myRouter
        });

}

handleBranchInventory(config);


// send file to ziadalite 
function postZiadaLiteData(branch, expiries,database) {

    let url = "https://pharmaplusziadalite.co.ke/core/api/handle_expiries.php";

    const body = { branch: branch, expiries: expiries,database:database };

    axios.post(url, body)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });

}

