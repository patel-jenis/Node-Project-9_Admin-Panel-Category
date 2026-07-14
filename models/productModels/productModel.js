const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            required: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        productPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        productDescription: {
            type: String,
            trim: true,
        },

        productImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("products", productSchema);

module.exports = Product;