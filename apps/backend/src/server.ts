import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "@/routes/auth.route.js";
import jobRoutes from "@/routes/job.route.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "@/middleware/error-handler.middleware.js";
import documentRoutes from "./routes/document.route.js";

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/document", documentRoutes);

// Global error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
