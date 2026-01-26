import express from "express";
import {
  registerUser,
  loginUser,
  upgraderUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/upgrade", protect, upgraderUser);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
