import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

// Middleware
const allowedOrigins = process.env.ORIGIN?.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins?.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api", authRoutes);

// Global error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
