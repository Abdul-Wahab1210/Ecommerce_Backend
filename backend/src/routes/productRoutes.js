import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createProduct,
  getProducts,
  getSellerProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);

router.post(
  "/",
  protect,
  authorize("seller"),
  upload.array("images", 5),
  createProduct
);

router.get("/dashboard", protect, authorize("seller"), getSellerProducts);

router.put(
  "/:id",
  protect,
  authorize("seller"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, authorize("seller"), deleteProduct);

export default router;
