const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const creds = require('./creds');
const client = require('twilio')(creds.tName, creds.tPW);
const dbController = require('./dbController');

const PORT = process.env.PORT || 3000;

mongoose.connect(creds.mongoose);
mongoose.connection.once('open', () => {
  console.log('Connected to Database');
});

app.use(express.static(path.join(__dirname, './../node_modules/')));
app.use(express.static(path.join(__dirname, './../client/')));
app.use(bodyParser.urlencoded({ extended: true }));


app.post("/sms", dbController.ParseText)
app.get('/getsms', dbController.getList)

app.listen(PORT, () => {
  console.log('Listening on port 3000');
});