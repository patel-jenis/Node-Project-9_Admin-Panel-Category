const path = require("path");
const Category = require("../../models/categoryModels/categoryModel");
const Product = require("../../models/productModels/productModel");
const fs = require("fs");

const viewProductController = async (req, res) => {
    try {

        // const products = await Product.find().populate("category", "categoryName");
        const products = await Product.find().populate({ path: "category", select: "categoryName" });

        res.render("view-product", {
            user: req.user,
            products,
        });

    } catch (error) {
        console.log("View Product Error:", error);
        res.status(500).send("Internal Server Error");
    }
};


const addController = async (req, res) => {
    try {
        const categories = await Category.find();

        res.render("add-product", {
            user: req.user,
            categories,
            errorMsg: null,
        });
    } catch (err) {
        console.log(err);
    }
};

const addProductController = async (req, res) => {
    try {

        const { category, productName, productPrice, productDescription } = req.body;

        // Validation
        if (!category || !productName || !productPrice || !productDescription) {

            const categories = await Category.find();

            return res.render("add-product", {
                user: req.user,
                categories,
                errorMsg: "All fields are required.",
            });
        }

        await Product.create({
            category,
            productName,
            productPrice,
            productDescription,
            productImage: req.file.path,
        });

        req.flash("success", "Product added successfully.");

        return res.redirect("/product/view-product");

    } catch (error) {
        console.log("Add Product Error:", error);

        const categories = await Category.find();

        return res.render("add-product", {
            user: req.user,
            categories,
            errorMsg: "Something went wrong.",
        });
    }
};

const editController = async (req, res) => {
    try {

        const { id } = req.params;

        const product = await Product.findById(id);
        const categories = await Category.find();

        res.render("edit-product", {
            user: req.user,
            product,
            categories,
            errorMsg: null,
        });

    } catch (err) {
        console.log("Error:", err);
        res.render("err");
    }
};

const deleteProductController = async (req, res) => {
    try {

        const { id } = req.params;
        const product = await Product.findById(id);

        if (product.productImage) {
            fs.unlink(product.productImage, (err) => {
                if (err) {
                    console.log("Error deleting image:", err);
                } else {
                    console.log("Product Image deleted successfully");
                }
            });
        }

        await Product.findByIdAndDelete(id);

        req.flash("success", "Product deleted successfully.");
        res.redirect("/product/view-product");

    } catch (err) {
        console.log("Error:", err);
        res.render("err");
    }
};

const updateProductController = async (req, res) => {
    try {

        let product = await Product.findById(req.body.id);

        if (product.productImage && req.file) {

            fs.unlink(product.productImage, (err) => {
                if (err) {
                    console.log("Error deleting old image:", err);
                } else {
                    console.log("Old product image deleted successfully");
                }
            });

            await Product.findByIdAndUpdate(req.body.id, {
                ...req.body,
                productImage: req.file.path
            });

        } else {

            await Product.findByIdAndUpdate(req.body.id, req.body);

        }

        req.flash("success", "Product updated successfully.");

        res.redirect("/product/view-product");

    } catch (err) {
        console.log("Error:", err);
        res.send("Something Went Wrong...");
    }
};


const viewSingleProductController = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id).populate({ path: "category", select: "categoryName" });

        // const category = await Category.findById(product.category);

        res.render("viewSingleProduct", {
            user: req.user,
            product,
        });

    } catch (err) {
        console.log("Error:", err);
        res.send("Something Went Wrong...");
    }
};

module.exports = {
    addController,
    addProductController,
    viewProductController,
    deleteProductController,
    editController,
    updateProductController,
    viewSingleProductController
};