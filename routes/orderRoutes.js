const express = require("express");
const studentInfo = require('../models/studentInfo');
var mailer = require('../functions/mailer');
var utils=require('../functions/utils');
const { models } = require('mongoose');
router = express.Router();
var {globalEmail}=require('./loginRoutes');
const orderInfo = require('../models/orderInfo');


   

 
module.exports = function (app) {
    app.use("/", router);
    };
