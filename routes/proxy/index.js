var express = require('express');
var router = express.Router();
const processRequest = require('./process-request')



router.all('/:format(get|raw|json|info)', processRequest)



module.exports = router;