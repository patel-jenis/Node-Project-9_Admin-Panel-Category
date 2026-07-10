const passport = require('../../middlewares/passport');
const User = require('../../models/userModels/userModel');
const bcrypt = require('bcrypt');
const otpGenerator = require("otp-generator");

let errorMsg = "";

const authController = (req, res) => {
    res.send("Welcome to auth route for signup page goes to /signUp...");
}

const signUpAuthController = (req, res) => {
    res.render("auth-signUp");
}
const signInAuthController = (req, res) => {
    res.render("auth-signIn", { errorMsg });
    errorMsg = "";
}

const registerController = async (req, res) => {
    try {

        let { name, email, password } = req.body;

        let hashPass = await bcrypt.hash(password, 12);

        const user = await User({
            name,
            email,
            password: hashPass,
        });

        await user.save();

        res.redirect("/auth/signIn");

    } catch (err) {
        console.log("Something went wrong...", err);
    }
}

const loginController = async (req, res) => {

    passport.authenticate("local", (err, user, info) => {
        if (info && info.message == "User not found") {

            return res.redirect("/auth/signUp");

        } else if (info && info.message == "Password not match") {

            errorMsg = "Password does not match";
            return res.redirect("/auth/signIn");

        } else if (!info && user) {

            req.logIn(user, (err) => {
                req.user = user;
                return res.redirect("/dashboard");
            });

        }
    })(req, res);

}

const logOutController = (req, res) => {

    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("/auth/signIn");
    });

}

const changePasswordController = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.passwordBlockedUntil && user.passwordBlockedUntil <= new Date()) {
            user.passwordBlockedUntil = null;
            user.passwordAttempts = 0;
            await user.save();
        }

        let remainingTime = 0;

        if (user.passwordBlockedUntil && user.passwordBlockedUntil > new Date()) {
            remainingTime = Math.floor((user.passwordBlockedUntil - new Date()) / 1000);
        }

        res.render("changePassword", {
            errorMsg,
            remainingTime,
        });

        errorMsg = "";
    } catch (err) {
        console.log("Error:", err);
    }
};

const changedPasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const user = await User.findById(req.user._id);

        if (user.passwordBlockedUntil && user.passwordBlockedUntil <= new Date()) {
            user.passwordBlockedUntil = null;
            user.passwordAttempts = 0;
            await user.save();
        }

        if (user.passwordBlockedUntil && user.passwordBlockedUntil > new Date()) {
            return res.redirect("/auth/change-password");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            user.passwordAttempts += 1;

            if (user.passwordAttempts >= 3) {
                user.passwordAttempts = 0;
                user.passwordBlockedUntil = new Date(
                    Date.now() + 5 * 60 * 1000
                );
            } else {
                errorMsg = `Current password is incorrect. ${3 - user.passwordAttempts
                    } attempt(s) remaining.`;
            }

            await user.save();
            return res.redirect("/auth/change-password");
        }

        user.passwordAttempts = 0;
        user.passwordBlockedUntil = null;
        await user.save();

        if (newPassword !== confirmPassword) {
            errorMsg =
                "New password and confirm password do not match.";

            return res.redirect("/auth/change-password");
        }

        const samePassword = await bcrypt.compare(newPassword, user.password);

        if (samePassword) {
            errorMsg =
                "New password cannot be the same as the old password.";

            return res.redirect("/auth/change-password");
        }

        const hashPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashPassword;
        await user.save();

        return res.redirect("/auth/logOut");
    } catch (err) {
        console.log("Error:", err);
    }
};

const forgotPasswordController = (req, res) => {
    res.render("forgot-password", {
        errorMsg: null
    });
};

const checkUserController = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.render("forgot-password", {
                errorMsg: "No account found with this email."
            });
        }

        // Generate 6-digit OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true
        });

        // OTP Expiry (5 Minutes)
        const otpExpire = Date.now() + (5 * 60 * 1000);

        // Save OTP & Expiry
        user.otp = otp;
        user.otpExpire = otpExpire;

        await user.save();

        console.log("======================================");
        console.log("Password Reset OTP :", otp);
        console.log("Valid For : 5 Minutes");
        console.log("======================================");

        return res.render("verify-otp", {
            userId: user._id,
            otpExpire: user.otpExpire.getTime(),
            errorMsg: null
        });

    } catch (error) {

        console.log(error);

        return res.render("forgot-password", {
            errorMsg: "Something went wrong. Please try again."
        });

    }
};

const verifyOtpController = async (req, res) => {
    try {

        const { userId, otp } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.redirect("/auth/forgot-password");
        }

        if (user.otp !== otp) {
            return res.render("verify-otp", {
                userId,
                otpExpire: user.otpExpire.getTime(),
                errorMsg: "Invalid OTP"
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.render("verify-otp", {
                userId,
                otpExpire: user.otpExpire.getTime(),
                errorMsg: "OTP has expired"
            });
        }

        // Optional: Clear OTP after successful verification
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        return res.render("reset-password", {
            userId,
            errorMsg: null
        });

    } catch (error) {

        console.log(error);

        const user = await User.findById(req.body.userId);

        return res.render("verify-otp", {
            userId: req.body.userId,
            otpExpire: user ? user.otpExpire : null,
            errorMsg: "Something went wrong."
        });

    }
};

const resendOtpController = async (req, res) => {
    try {

        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.redirect("/auth/forgot-password");
        }

        // Generate New OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true
        });

        // Update OTP & Expiry
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        await user.save();

        // Console (Replace with Email later)
        console.log("======================================");
        console.log("New Password Reset OTP :", otp);
        console.log("Valid For : 5 Minutes");
        console.log("======================================");

        return res.render("verify-otp", {
            userId: user._id,
            otpExpire: user.otpExpire.getTime(),
            errorMsg: null
        });

    } catch (error) {

        console.log(error);

        return res.redirect("/auth/forgot-password");

    }
};

const updatePasswordController = async (req, res) => {
    try {

        const { userId, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render("reset-password", {
                userId,
                errorMsg: "Passwords do not match."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.redirect("/auth/forgot-password");
        }

        const isSamePassword = await bcrypt.compare(password, user.password);

        if (isSamePassword) {
            return res.render("reset-password", {
                userId,
                errorMsg: "New password cannot be the same as your old password."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.findByIdAndUpdate(userId, {
            password: hashedPassword
        });

        return res.redirect("/auth/signIn");

    } catch (error) {
        console.log(error);

        return res.render("reset-password", {
            userId: req.body.userId,
            errorMsg: "Something went wrong."
        });
    }
};

module.exports = {
    authController,
    signUpAuthController,
    signInAuthController,
    registerController,
    loginController,
    logOutController,
    changePasswordController,
    changedPasswordController,
    forgotPasswordController,
    checkUserController,
    updatePasswordController,
    verifyOtpController,
    resendOtpController
}