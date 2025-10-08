import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {errorMiddleware} from "@eshop/common";

const env = process.argv[2] || "dev"; // default to dev

// Load the right .env file
const envFile = path.resolve(__dirname, `../.env.${env}`);
dotenv.config({ path: envFile });

const app = express();

const PORT = process.env.PORT ?? 3000;
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.use(errorMiddleware);
const authServer = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
authServer.on("error", (err) => {
  console.log("Auth Server Error:", err);
});
app.get("/", async (req, res) => {
  res.send({ msg: "From Proxy Hello you are in auth service 2" });
});
