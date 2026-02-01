import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL?.replace(/\/$/, ""), // remove trailing slash
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman or server requests
      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.some(
        (o) => o.replace(/\/$/, "") === normalizedOrigin,
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("Blocked CORS for origin:", origin);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true, // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

// Handle preflight
app.options("*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorMiddleware);

export default app;
