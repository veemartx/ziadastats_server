const sql = require('mssql')
const fs = require('fs');
const config = require('../models/connect');
const axios = require('axios');


sql.on('error', err => {
    // ... error handler
    console.log(err);
})

var database = process.argv[2];

var branch = process.argv[3];

function handleBranchInventory(config) {
    sql.connect(config)
        .then(function () {
            return sql.query(`
            USE [${database}];

            SELECT
             [STK_NUM]
            ,[STKENTRYNO]
            ,[DOC_DETNUM]
            ,[DOC_NUM]
            ,[DOC_DATE]
            ,[INV_CODE]
            ,[EXPIRY_DATE]
            ,[LOC_CODE]
            ,[QTY_IN]
            ,[POSTED]
            ,[QTY_BAL]
            ,[USERNAME]
            ,[partwhole]
            ,[BCODE]
            ,[savetime]
            from dbo.STOCKTRANS
            WHERE QTY_BAL>0 AND EXPIRY_DATE>'2022-03-01' AND POSTED=1
            `)
        })
        .then(function (recordset) {
            sql.close();


            // console.log(recordset['recordset']);

            postZiadaLiteData(branch, recordset['recordset'], database);

        })
        .catch(function (err) {
            sql.close();
            throw err; // it can be done so that you can handle the errors in myRouter
        });

}

handleBranchInventory(config);



// send file to ziadalite 
function postZiadaLiteData(branch, stock, database) {

    let url = "https://pharmaplusziadalite.co.ke/core/api/handle_stock_trans_in.php";

    const body = { branch: branch, stock: stock, database: database };


    axios.post(url, body, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });

}