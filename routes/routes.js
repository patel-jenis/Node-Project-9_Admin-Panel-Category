const express = require('express');
const { dasboardContoller } = require('../controllers/dasboardContollers/dasboardContoller');
const authRoutes = require('./authRoutes/authRoutes');
const dasboardRoutes = require('./dashboardRoutes/dashboardRoutes');
const { loginCheck } = require('../middlewares/authenticate');
const productRoute = require('./productRoutes/productRoute');

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/dashboard", dasboardRoutes);
routes.use("/category", dasboardRoutes);
routes.use("/product", productRoute);

routes.get("/", loginCheck, dasboardContoller);

module.exports = routes;