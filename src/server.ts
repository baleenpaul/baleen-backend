import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import feedRouter from "./routes/feed";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", function(req, res) {
  res.send("Baleen backend running.");
});

app.use("/feed", feedRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log("Baleen backend live on port " + PORT);
});
