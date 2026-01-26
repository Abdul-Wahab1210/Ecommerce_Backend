import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateSellerProductStatus,
  updateBuyerOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), createOrder);

router.get("/", protect, authorize("buyer"), getBuyerOrders);

router.get("/seller", protect, authorize("seller"), getSellerOrders);

router.patch(
  "/:orderId/seller",
  protect,
  authorize("seller"),
  updateSellerProductStatus,
);

// Buyer cancels order
router.patch("/:orderId/buyer", protect, authorize("buyer"), updateBuyerOrder);

export default router;
