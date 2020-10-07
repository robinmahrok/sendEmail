'use strict'

const url_routes = require('./urlRoutes');
const login_routes = require('./loginRoutes');
const routes = (app) => {
  url_routes(app);
  login_routes(app);
}
module.exports = routes;
