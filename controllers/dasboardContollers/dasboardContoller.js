const fs = require('fs');
const User = require("../../models/userModels/userModel");
const Category = require("../../models/categoryModels/categoryModel");
const Product = require('../../models/productModels/productModel');

const dasboardContoller = async (req, res) => {
    try {
        const totalCategories = await Category.countDocuments();

        res.render("index", {
            user: req.user,
            totalCategories
        });

    } catch (err) {
        console.log(err);
    }
};
const addContoller = (req, res) => {
    res.render("addCategory", { user: req.user, errorMsg: null });
}

const viewCategoryController = async (req, res) => {
    try {
        let categories = await Category.find();

        res.render("view", { categories, user: req.user });

    } catch (err) {
        console.log("Error: ", err);
        res.send("Something went wrong...");
    }
}

const addCategoryContoller = async (req, res) => {
    try {
        await Category.create({
            categoryName: req.body.categoryName,
        });

        req.flash("success", "Category added successfully.");

        res.redirect("/category/view-Category");

    } catch (err) {
        if (err.code === 11000) {

            req.flash("error", "Category already exists.");
            return res.render("addCategory", {
                user: req.user,
                errorMsg: "Category already exists."
            });
        }

        console.log("Error:", err);
        req.flash("error", "Something went wrong.");

        return res.render("addCategory", {
            user: req.user,
            errorMsg: "Something went wrong."
        });
    }
};

const editController = async (req, res) => {
    try {

        let { id } = req.params;

        let category = await Category.findById(id);

        res.render("editCategory", { category, user: req.user, errorMsg: null });

    } catch (err) {
        console.log("Error: ", err);
        res.send("Something Went Wrong...");
    }
}

const updateController = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.body.id, {
            categoryName: req.body.categoryName,
        });

        req.flash("success", "Category updated successfully.");
        res.redirect("/category/view-Category");

    } catch (err) {
        if (err.code === 11000) {
            const category = await Category.findById(req.body.id);

            req.flash("error", "Category already exists.");

            return res.render("editCategory", {
                category,
                user: req.user,
                errorMsg: "Category already exists."
            });
        }

        req.flash("error", "Something went wrong.");
        res.send("Something Went Wrong...");
    }
};

const deleteController = async (req, res) => {
    try {

        const categoryId = req.params.id;

        // Delete all products of this category
        await Product.deleteMany({
            category: categoryId
        });

        // Delete category
        await Category.findByIdAndDelete(categoryId);

        req.flash("success", "Category and all related products deleted successfully.");
        return res.redirect("/category/view-Category");

    } catch (error) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/category/view-Category");
    }
};


const profileContoller = (req, res) => {
    res.render("profile", { user: req.user });
}

const profileEditContoller = (req, res) => {
    res.render("editProfile", { user: req.user });
}

const profileUpdateController = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const updateData = {
            name: req.body.name,
            phone: req.body.phone,
            dob: req.body.dob,
            location: req.body.location,
            about: req.body.about,
        };

        // New image uploaded
        if (req.file) {

            // Delete old image if it exists
            if (user.image) {
                fs.unlink(user.image, (err) => {
                    if (err) {
                        console.log("Error deleting old image:", err);
                    } else {
                        console.log("Old profile image deleted.");
                    }
                });
            }

            updateData.image = req.file.path;
        }

        await User.findByIdAndUpdate(
            req.user._id,
            updateData
        );

        res.redirect("/dashboard/profile");

    } catch (err) {
        console.log("Error:", err);
        res.redirect("/dashboard/profile/edit");
    }
};

module.exports = {
    dasboardContoller,
    addContoller,
    addCategoryContoller,
    viewCategoryController,
    editController,
    updateController,
    deleteController,
    profileContoller,
    profileEditContoller,
    profileUpdateController
}