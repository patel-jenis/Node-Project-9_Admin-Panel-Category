const mongoose = require('mongoose');

const db = async () => {

    await mongoose.connect('mongodb://localhost:27017/adminPanel').then(() => {
        console.log("db Connected...");
    }).catch((err) => {
        console.log("db Connection Error");
    })
};

module.exports = db;