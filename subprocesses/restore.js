const dotenv = require('dotenv');
const config = require('../models/connect')
const sql = require('mssql');
fs = require('fs');

dotenv.config();

let baseDir = '/opt/ziadastats/ziadastats_server';

// get the arguments passed here that is the filename
let dbArchive = process.argv[2];

let branch = process.argv[3];

// // remove the bak extension 
let nameWithoutBakExtension = dbArchive.split('.')[0];
// // 
let targetDir = baseDir + '/static/extracts/';


// catch errors
sql.on('error', err => {
    // ... error handler
    console.log(`sql error ${err}`);
})


function restoreDatabase() {

    // create the directories 
    var fs = require('fs');
    var dir = 'static/databases/' + branch + '/';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }


    // full path
    let path = baseDir + "/" + dir;

    // 
    console.log('starting restoration');

    sql.connect(config)
        .then(() => {
            return sql.query(
                `
                USE master;

                EXEC RestoreDatabase @ldbName='${nameWithoutBakExtension}',@dbname='${nameWithoutBakExtension}',
                @Directory_Bak='${targetDir}',				
                @Directory_Dat='${path}',
                @Directory_Log ='${path}'
                 `
            )
        })
        .then((resultSet) => {

            sql.close();

            console.log(resultSet);

        })
}

restoreDatabase();