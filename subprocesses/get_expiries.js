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


function alterGetExpiryProcedure(config) {

    // update the config
    config.options.database=database;

    sql.connect(config)
        .then(function () {
            return sql.query(`
            ALTER procedure [dbo].[qrystockexpiry]
             @EndDate varchar(10)
            AS
            
             select  stocktrans.loc_code,stocktrans.expiry_date,savetime,
             sum(isnull(stocktrans.qty_in,0) - isnull(xstocktransout.qty_out,0)) 
             as qty ,inventory.description as ItemName,inventory.inv_code,inventory.inv_avgcost ,
            
            CASE SYSDEFAULTS.PARTWHOLE WHEN 1 THEN 
                CASE SYSDEFAULTS.PRICINGWHOLE WHEN 1 THEN   
                    inv_avgcost/(case pack_qty when 0 then 1  when null then 1 else pack_qty END )  
                else 
                    inv_avgcost 
                end
            ELSE 
                inv_avgcost 
            END AS CALCCOST
            
             from sysdefaults,stocktrans  inner join location on location.loc_code = stocktrans.loc_code
            inner join inventory on stocktrans.inv_code = inventory.inv_code
             left join  
             ( select inv_code ,sum(stocktransout.qty_out) as qty_out,instkentryno,instk_num 
             from stocktransout  group by  
             inv_code,instkentryno,instk_num ) xstocktransout 
             on (stocktrans.stkentryno = xstocktransout.instkentryno 
             and stocktrans.stk_num = xstocktransout.instk_num and stocktrans.inv_code = xstocktransout.inv_code) 
             where  stocktrans.posted = 1 
             and  (isnull(stocktrans.qty_in,0) - isnull(xstocktransout.qty_out,0)) > 0 
             and 1= case when (@EndDate ='' or @EndDate is null) then 1 else case when (stocktrans.expiry_date<=cast(@EndDate as datetime)) then 1 else 2 end end  
             and INVENTORY.noexpiry = 0  and INVENTORY.INV_PHYSICALITEM = 1 
             group by  stocktrans.loc_code,stocktrans.expiry_date,stocktrans.savetime,inventory.description,inventory.inv_unit,inventory.inv_code,inventory.inv_avgcost,SYSDEFAULTS.PRICINGWHOLE,inventory.pack_qty,SYSDEFAULTS.partwhole
             order by inventory.description,stocktrans.expiry_date
             
            `)
        })
        .then(function (recordset) {
            sql.close();

            // once done call the function to get expiries
            getExpiries(config);
        })
        .catch(function (err) {
            sql.close();
            throw err; // it can be done so that you can handle the errors in myRouter
        });

}

alterGetExpiryProcedure(config);


function getExpiries(){

    sql.connect(config)
        .then(function () {
            return sql.query(`
            DECLARE	@return_value int
            EXEC	@return_value = [dbo].[qrystockexpiry]
                   @EndDate = NULL
           
            `)
        })
        .then(function (recordset) {
            sql.close();
            postZiadaLiteData(branch, recordset.recordset,database);
        
        })
        .catch(function (err) {
            sql.close();
            throw err; // it can be done so that you can handle the errors in myRouter
        });
}
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

