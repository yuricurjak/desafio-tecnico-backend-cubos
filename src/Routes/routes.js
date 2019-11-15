const express = require('express').Router();
const rules = require('../Controllers/controllerMain');
const bodyParser = require('body-parser');
express.use(bodyParser.json());

express.post('/registerRule', rules.registerRule);

express.delete('/deleteRule', rules.deleteRule);

express.get('/listRules', rules.listRules);

express.post('/listAvailableTimes', rules.availableTimes);


module.exports = express;