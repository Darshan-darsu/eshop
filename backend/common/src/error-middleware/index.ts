import { AppError } from "./error-handler";
import {  ErrorRequestHandler } from "express";
export { ValidationError } from "./error-handler"; 

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  console.log("Unhandled Error", err);
  res.status(500).json({
    error: "Something went wrong please try again",
  });
  return;
};
