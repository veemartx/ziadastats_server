const chokidar = require('chokidar');

let dir = "./static/extracts/";

var watcher = chokidar.watch('file or dir', { ignored: /[\/\\]\./, persistent: true });

watcher.on('add', function (path) {

    console.log('File', path, 'has been added');

    // initiate a restore process
    

})
