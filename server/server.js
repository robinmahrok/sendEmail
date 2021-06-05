const express = require('express');
const Mongoose = require('mongoose');
const routes = require('./routes/index.js');
var bodyParser = require('body-parser');
var cors = require("cors");
//const fileupload = require("express-fileupload");

const app = express();
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(express.static("public"));
app.get("/test",(req,res)=>{
  res.status(200).send({message:'Works!'})
})
Mongoose.connection;
routes(app);

app.listen(process.env.PORT || 3005);