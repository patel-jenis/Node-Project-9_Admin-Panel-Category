const passport = require('../../middlewares/passport');
const User = require('../../models/userModels/userModel');
const bcrypt = require('bcrypt');

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
module.exports = {
    authController,
    signUpAuthController,
    signInAuthController,
    registerController,
    loginController,
    logOutController,
    changePasswordController,
    changedPasswordController
}