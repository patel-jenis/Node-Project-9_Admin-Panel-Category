const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        dob: {
            type: Date,
            default: null,
        },

        location: {
            type: String,
            default: "",
            trim: true,
        },

        about: {
            type: String,
            default: "",
            trim: true,
        },

        image: {
            type: String,
            default: "",
        },

        passwordAttempts: {
            type: Number,
            default: 0,
        },

        passwordBlockedUntil: {
            type: Date,
            default: null,
        },

        otp: {
            type: String,
            default: null
        },

        otpExpire: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("users", userSchema);

module.exports = User;