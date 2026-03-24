import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { activityRouter } from "./modules/activity/activity.route.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.route.js";
import { exportRouter } from "./modules/export/export.route.js";
import { projectsRouter } from "./modules/projects/projects.route.js";
import { searchRouter } from "./modules/search/search.route.js";
import { sectionsRouter } from "./modules/sections/sections.route.js";
import { tasksRouter } from "./modules/tasks/tasks.route.js";
import { usersRouter } from "./modules/users/users.route.js";

export const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "VistaFlow API",
  });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/export", exportRouter);
app.use("/api/search", searchRouter);
app.use("/api/activity", activityRouter);

app.use(notFoundHandler);
app.use(errorHandler);
