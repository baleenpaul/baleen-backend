import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import feedRouter from "./routes/feed";
import authRouter from "./routes/auth";
import interactionsRouter from "./routes/interactions";
import { initBlueskySession } from "./services/blueskyClient";

const app = express();

// Initialize Bluesky auth on startup
initBlueskySession();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", function(req, res) {
  res.send("Baleen backend running.");
});

app.use("/feed", feedRouter);
app.use("/auth", authRouter);
app.use("/interactions", interactionsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log("Baleen backend live on port " + PORT);
});
