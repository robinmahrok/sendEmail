const express = require('express');
const app = express();
const Mongoose = require('mongoose');

const { dbURL } = require(`./config/config`);
const routes = require('./routes/index.js');


Mongoose.connect(dbURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  useCreateIndex:true
  });
  
  Mongoose.connection;
  routes(app);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

app.listen(process.env.PORT || 3005);