import "reflect-metadata";
import express from "express";
import cors from "cors";
import path from "path";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import gamesRouter from "./routes/games";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
  cors(
    process.env.NODE_ENV === "production"
      ? { origin: process.env.CLIENT_URL }
      : {},
  ),
);
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), "../client/dist")));

// Routes
app.get("/api/config", (_req, res) => {
  const nodeEnv = process.env.NODE_ENV || "development";
  res.json({
    nodeEnv,
    showMovementToggle: nodeEnv === "development",
  });
});

app.use("/api/games", gamesRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "../client/dist", "index.html"));
});

// Initialize DB and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection initialized successfully.");
    app.listen(port, () => {
      console.log(`Server is running gracefully on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
