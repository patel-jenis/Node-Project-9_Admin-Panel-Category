const express = require('express');
const { authController, signUpAuthController, signInAuthController, registerController, loginController, logOutController, changePasswordController, changedPasswordController, forgotPasswordController, checkUserController, updatePasswordController, verifyOtpController, resendOtpController } = require('../../controllers/authControllers/authController');
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
authRoutes.post("/changed-password", loginCheck, changedPasswordController);
authRoutes.get("/forgot-password", forgotPasswordController);
authRoutes.post("/forgot-password", checkUserController);
authRoutes.post("/reset-password", updatePasswordController);
authRoutes.post("/verify-otp", verifyOtpController);
authRoutes.post("/resend-otp", resendOtpController);

module.exports = authRoutes;