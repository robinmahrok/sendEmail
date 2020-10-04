'use strict'

const url_routes = require('./urlRoutes');
const routes = (app) => {
  url_routes(app);
  
}
module.exports = routes;
