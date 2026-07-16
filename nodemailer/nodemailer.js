const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: "jenispatel2409@gmail.com",
        pass: "hdewmgfivccmxtns"
    }
});

module.exports = transporter;