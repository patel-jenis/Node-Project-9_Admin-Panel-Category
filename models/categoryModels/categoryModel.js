const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
)

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;