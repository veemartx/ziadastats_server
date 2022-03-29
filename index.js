const express = require('express')
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const os = require("os");
const { fork } = require("child_process");

// read the .env file 
dotenv.config();

let baseDir = process.env.BASEDIR;

const app = express()
const port = 3000

if (baseDir == '') {
  // user middlewar
  app.use(setEnv);
}

// bodyparser middleware 
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// cors middleware 
app.use(cors())

// static public middleware 
app.use(express.static('public'));

// api middleware
app.use('/api/db', require('./routes/api/db'));
// app.use('/api/products',require('./routes/api/products'));
// app.use('/api/register',require('./routes/api/register'));
// app.use('/api/customers',require('./routes/api/customers'));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

// start wacthing uploadts
const watchBackupExtracts = fork('./subprocesses/watch_extracts.js');

watchBackupExtracts.on('message', (message) => {
  console.log(message);
})

watchBackupExtracts.on(`close`, (code) => {
  console.log(`Watch file subprocesse exited with code ${code}`)
})

// set base dir in env file middleware
function setEnv(req, res, next) {

  setEnvValue('BASEDIR', `${process.cwd()} `);

  console.log('middle ware used');

  next();

}

// sent env function
function setEnvValue(key, value) {

  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

  // find the env we want based on the key
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
    return line.match(new RegExp(key));
  }));

  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);

  // write everything back to the file system
  fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}
