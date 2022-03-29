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
            
            select  TOP (20)
            [CSALE_NUM]
            ,[INV_CODE]
            ,[QUANTITY]
            ,[TAX_CODE]
            ,[PRICE]
            ,[UNIT]
            ,[TOTALCOST]
            ,[DESCRIPTION]
            ,[inv_strength]
            ,[Qty_Left]
            ,[Trans_Time]
            ,[STK_NUM]
            ,[mylineno]
            ,[partwhole]
            ,[PACKQTY]
            ,[PWQTY]
            ,[bcode]
            ,[itemavgcost]
            ,[bcode]
            ,[taxamt]
            ,[priceincl]
            ,[CSALE_DET_NUM]
            from dbo.CSALE_DT
            
            WHERE Trans_Time>'2022-01-01 00:00:00'`)
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


function postZiadaLiteData(branch, cashSaleData,database) {

    let url = "https://pharmaplusziadalite.co.ke/core/api/handle_csale_dt.php";

    const body = { branch: branch, cashSaleData: cashSaleData,database:database };

    axios.post(url, body)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });

}