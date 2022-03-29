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
            
            select  TOP(20)
            [CSALE_NUM]
            ,[CSALE_DATE]
            ,[CSALE_VAT]
            ,[CSALE_NET]
            ,[CSALE_TOTAL]
            ,[BATCHED]
            ,[csale_number]
            ,[PAYMODE]
            ,[cash_collector]
            ,[customer_name]
            ,[cashpaid]
            ,[UserName]
            ,[LASTUPDATE]
            ,[lastlineno]
            ,[cashfromcustomer]
            ,[bcode]
            ,[savetime]
            ,[updatetime]
            from dbo.CSALE_HD
            
            WHERE CSALE_DATE>'2022-01-01'`)
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



function postZiadaLiteData(branch, cashSaleHead,database) {

    let url = "https://pharmaplusziadalite.co.ke/core/api/handle_csale_hd.php";

    const body = { branch: branch, cashSaleHead: cashSaleHead,database:database };

    axios.post(url, body)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });

}