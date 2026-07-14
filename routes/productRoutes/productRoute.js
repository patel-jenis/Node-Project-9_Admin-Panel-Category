const express = require('express');
const { loginCheck } = require('../../middlewares/authenticate');
const upload = require('../../middlewares/multer');
const { addController, addProductController, viewProductController, deleteProductController, editController, updateProductController, viewSingleProductController } = require('../../controllers/productControllers/productController');

const productRoute = express.Router();

productRoute.get("/add", loginCheck, addController);
productRoute.get("/view-product", loginCheck, viewProductController);
productRoute.get("/edit/:id", loginCheck, editController);
productRoute.get("/delete/:id", loginCheck, deleteProductController);
productRoute.get("/view/:id", loginCheck, viewSingleProductController);
productRoute.post("/addProduct", loginCheck, upload.single("productImage"), addProductController);
productRoute.post("/updateProduct", loginCheck, upload.single("productImage"), updateProductController);

module.exports = productRoute;