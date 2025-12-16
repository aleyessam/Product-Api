const express = require("express");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validations/product.validation");
const controller = require("../controllers/product.controller");

const router = express.Router();

router.post(
  "/",
  auth("admin"),
  validate(createProductSchema),
  controller.createProduct
);

router.get("/", auth(), controller.getAllProducts);

router.get("/stats", auth("admin"), controller.getProductStats);

router.get("/:id", auth(), controller.getProduct);

router.put(
  "/:id",
  auth("admin"),
  validate(updateProductSchema),
  controller.updateProduct
);

router.delete("/:id", auth("admin"), controller.deleteProduct);

module.exports = router;
