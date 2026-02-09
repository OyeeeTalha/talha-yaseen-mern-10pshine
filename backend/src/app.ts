import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";

import { pinoHttp } from "pino-http";
import logger from "./shared/utils/logger.js";
import { globalErrorHandler } from "./shared/middlewares/globalErrorHandler.js";
import { AppError } from "./shared/errors/AppError.js";

import { ExpressAuth } from "@auth/express";
import { authConfig } from "./features/auth/config.js";
import noteRoutes from "./features/notes/routes.js";

import userRoutes from "./features/user/routes.js";

import contactRoutes from "./features/contact/routes.js";
import * as timers from "./config/timers.config.js";

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  pinoHttp({
    logger,
    // Custom serializers to clean up the output
    serializers: {
      req: (req: any) => ({
        method: req.method,
        url: req.url.split("?")[0],
      }),
      res: (res: any) => ({
        statusCode: res.statusCode,
      }),
    },
    wrapSerializers: true,
  }),
);

app.use(express.json());

//Auth Setup
// Trust Proxy is crucial for OAuth callbacks to correctly identify 'https' vs 'http'
app.set("trust proxy", true);

// Sets up routes: /auth/signin, /auth/callback/google, /auth/signout
app.use("/auth", ExpressAuth(authConfig));

//Express Routes
app.use("/notes", noteRoutes);

app.use("/user", userRoutes);

app.use("/", contactRoutes);



app.get("/config", (req, res) => {
  res.status(200).json(timers);
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the 10PShine Notes App Backend!",
    data: {
      service: "10pShine-backend",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
