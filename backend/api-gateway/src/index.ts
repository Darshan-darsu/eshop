import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";

import {errorMiddleware}  from "@eshop/common";



// Load environment
const env = process.argv[2] || "dev";
const envFile = path.resolve(__dirname, `../.env.${env}`);
dotenv.config({ path: envFile });

// Env variables
const authServiceProxy = process.env.AUTH_SERVICE ?? "http://localhost:5001";
const authServicE2EeProxy =
  process.env.AUTH_SERVICEE2E ?? "http://localhost:5002";
const PORT = parseInt(process.env.PORT ?? "3000", 10);

// App
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(errorMiddleware)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1); // This can be placed anywhere before rate limiting


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => ((req as any).user ? 1000 : 100),
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.ip,
});
app.use(limiter);

// Routes
app.get("/gateway-health", (_req, res) => {
  res.send({ message: "Welcome to api gateways" });
});

app.use("/", proxy(authServiceProxy));
app.use("/authe", proxy(authServicE2EeProxy));



// Server
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV ?? "development"
    } mode on port ${PORT}`
  );
  console.log(`Environment file loaded: ${envFile}`);
});
