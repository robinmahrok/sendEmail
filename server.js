const express = require('express');
const Mongoose = require('mongoose');
const { dbURL } = require(`./config/config`);
const routes = require('./routes/index.js');
var bodyParser = require('body-parser');
const session = require('express-session')
const app = express();

Mongoose.connect(dbURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  useCreateIndex:true
  });
  
  app.use(session({
     secret: 'ssshhhhh',
     resave:false,
     saveUninitialized:false
}
  ));

  app.set('view engine', 'ejs');
  app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(express.static("public"));
Mongoose.connection;
routes(app);


app.listen(process.env.PORT || 3005);