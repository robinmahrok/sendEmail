'use strict'
const login_routes = require('./loginRoutes');
const routes = (app) => {
  login_routes(app);
}
module.exports = routes;
