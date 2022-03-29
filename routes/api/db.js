// imports 
const { fork } = require('child_process');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './static/backups');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage: storage }).single('backup');

router.post('/restore', async (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {

            let baseDir = process.env.BASEDIR;

            console.log(baseDir);

            var filename = req.file.filename;

            var branch = req.body.branch;

            // filename without zip extension /
            let filenameWithoutZipExtensionArray = filename.split('.');

            let filenameWithoutZipExtension = filenameWithoutZipExtensionArray[0] + "." + filenameWithoutZipExtensionArray[1];

            let filenameWithoutBAKExtension = filenameWithoutZipExtension.split('.')[0];

            // start decompressing the file
            const uncompressBackup = fork('./subprocesses/uncompress.js', [filename, branch]);

            uncompressBackup.on('close', (code) => {

                console.log(`decompression subprocess exited with code ${code}`);

                // start restore process 
                // this time we need the restored db
                const restoreBackup = fork('./subprocesses/restore.js', [filenameWithoutZipExtension, branch]);

                restoreBackup.on("close", (code) => {

                    console.log(`Restore process exited with code ${code}`);

                    // start reading the data 
                    // get inventory 
                    const getInventory = fork('./subprocesses/get_inventory.js', [filenameWithoutBAKExtension, branch]);

                    getInventory.on('close', (code) => {

                        console.log(`Get Inventory Exited ${code}`);

                    })


                    // get cash sale head 
                    const getCashSaleHead = fork('./subprocesses/get_csale_hd.js', [filenameWithoutBAKExtension, branch]);

                    getCashSaleHead.on('close', (code) => {

                        console.log(`Cash Sale Head Process Exited With Code ${code}`);

                    })


                    const getCashSaleData = fork('./subprocesses/get_csale_dt.js', [filenameWithoutBAKExtension, branch]);

                    getCashSaleData.on('close', (code) => {

                        console.log(`Get Cash Sale Data Exited With Code ${code}`);

                    })


                    // get expiries
                    const getExpiries = fork('./subprocesses/get_expiries.js', [filenameWithoutBAKExtension, branch]);

                    getCashSaleData.on('close', (code) => {

                        console.log(`Get Expiries Exited With Code ${code}`);

                    })


                })

            })

            let currentTime = new Date();
            res.status(200).send(filename + " Upload Successful @" + currentTime);
        }
    })
})


module.exports = router;