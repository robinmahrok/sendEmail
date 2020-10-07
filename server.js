const express = require('express');
const app = express();
const Mongoose = require('mongoose');
const { dbURL } = require(`./config/config`);
const routes = require('./routes/index.js');
var bodyParser = require('body-parser');

Mongoose.connect(dbURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  useCreateIndex:true
  });
  
  app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }))
Mongoose.connection;
routes(app);


app.listen(process.env.PORT || 3005);