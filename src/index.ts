import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import feedRouter from "./routes/feed";
import interactionsRouter from "./routes/interactions";
import debugRouter from "./routes/debug";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/feed", feedRouter);
app.use("/interactions", interactionsRouter);
app.use("/", debugRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
