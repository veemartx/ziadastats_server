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

            select
            [INV_SUBGROUPCODE]
            ,[INV_CODE]
            ,[DESCRIPTION]
            ,[INV_STRENGTH]
            ,[UNIT_QTY]
            ,[INV_INSTOCKQTY]
            ,[INV_AVGCOST]
            ,[INV_LASTUNITCOST]
            ,[INV_MINPRICE]
            ,[INV_RETAILPRICE]
            ,[INV_COSTPRICE]
            ,[INV_TRADEPRICE]
            ,[INV_SPECIALPRICE]
            ,[INV_AVGSELLCOST]
            ,[COUNTER]
            ,[PACK_QTY]
            ,[CalcQty]
            ,[CarryF]
            ,[BroughtF]
            ,[inclusive]
            ,[kisimax]
            ,[INV_WSALEPRICE]
            ,[calcPW]
            ,[inv_minpricetrade]
            from dbo.INVENTORY WHERE [INV_INSTOCKQTY]>0`)
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
function postZiadaLiteData(branch, inventory,database) {

    let url = "https://pharmaplusziadalite.co.ke/core/api/handle_inventory.php";

    const body = { branch: branch, inventory: inventory,database:database };


    axios.post(url, body)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });

}