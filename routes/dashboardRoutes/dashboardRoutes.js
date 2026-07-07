const express = require('express');
const { dasboardContoller, addContoller, addCategoryContoller, viewCategoryController, editController, updateController, deleteController, profileContoller, profileEditContoller, profileUpdateController } = require('../../controllers/dasboardContollers/dasboardContoller');
const upload = require('../../middlewares/multer');
const { loginCheck } = require('../../middlewares/authenticate');

const dasboardRoutes = express.Router();

dasboardRoutes.get("/", loginCheck, dasboardContoller);
dasboardRoutes.get("/add", loginCheck, addContoller);
dasboardRoutes.post("/addCategory", loginCheck, addCategoryContoller);
dasboardRoutes.get("/view-Category", loginCheck, viewCategoryController);
dasboardRoutes.get("/edit/:id", loginCheck, editController);
dasboardRoutes.get("/delete/:id", loginCheck, deleteController);
dasboardRoutes.post("/updateCategory", loginCheck, updateController);

dasboardRoutes.get("/profile", loginCheck, profileContoller);
dasboardRoutes.get("/profile/edit", loginCheck, profileEditContoller);
dasboardRoutes.post("/profile/update", loginCheck, upload.single("image"), profileUpdateController);

module.exports = dasboardRoutes;