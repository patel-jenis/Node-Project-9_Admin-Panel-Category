const express = require('express');
const { authController, signUpAuthController, signInAuthController, registerController, loginController, logOutController, changePasswordController, changedPasswordController } = require('../../controllers/authControllers/authController');
const passport = require('../../middlewares/passport');
const { isLoggedIn, loginCheck } = require('../../middlewares/authenticate');

const authRoutes = express.Router();

authRoutes.get("/", authController);
authRoutes.get("/signUp", isLoggedIn, signUpAuthController);
authRoutes.get("/signIn", isLoggedIn, signInAuthController);
authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/logOut", loginCheck, logOutController);
authRoutes.get("/change-password", loginCheck, changePasswordController);
authRoutes.post("/changed-password", changedPasswordController);

module.exports = authRoutes;