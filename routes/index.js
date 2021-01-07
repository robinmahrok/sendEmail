'use strict'
const login_routes = require('./loginRoutes');
const shop_routes = require('./ShopkeeperRoutes');

const routes = (app) => {
  login_routes(app);
  shop_routes(app);

}
module.exports = routes;
