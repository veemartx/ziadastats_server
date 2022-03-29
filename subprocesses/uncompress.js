const fs = require('fs');
var DecompressZip = require('decompress-zip');


let dbArchive = "./static/backups/" + process.argv[2];

let branch = process.argv[3];

var unzipper = new DecompressZip(dbArchive);

unzipper.on('error', function (err) {
    console.log(`Caught an error ${err}`);
});

unzipper.on('extract', function (log) {
    // write this into the log file 

    // rename the backup file sasa 
    // fore renaming check if a file lil that exists

    // rename it twice 
    
    fs.rename('./static/extracts/' + log[0].deflated, './static/extracts/' + branch + "-" + log[0].deflated, function (err) {
        if (err) console.log('ERROR: ' + err);
    });

    console.log(log);
});

unzipper.on('progress', function (fileIndex, fileCount) {
    console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
});

unzipper.extract({
    path: './static/extracts/',
    restrict: false,
    filter: function (file) {
        return file.type !== "SymbolicLink";
    }
});