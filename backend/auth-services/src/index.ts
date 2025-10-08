import dotenv from "dotenv";
import path from "path";
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {errorMiddleware} from "@eshop/common";
import router from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./swagger-output.json";

const env = process.argv[2] || "dev";

const envFile = path.resolve(__dirname, `../.env.${env}`);
dotenv.config({ path: envFile });

const app: Express = express();

const PORT = process.env.PORT ?? 3000;
app.use(
  cors({
    origin: ["http://localhost:5001"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cookieParser());

app.use("/api/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocument))
app.get("/api/docs",(req,res)=>{
  res.send(swaggerDocument)
})
// Routes
app.use("/api",router)

app.use(errorMiddleware);
const authServerE2E = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Swagger running in http://localhost:${PORT}/docs`);
});
authServerE2E.on("error", (err) => {
  console.log("Auth Service E2E :", err);
});
app.get("/", async (req, res) => {
  res.send({ msg: "From proxy you are in proxy 1" });
});
