const loginCheck = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/auth/signIn");
    }

};

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/dashboard");
    } else {
        return next();
    }

};

module.exports = { loginCheck, isLoggedIn };