import "dotenv/config";
import express from "express";
import "./discord.js";
import { runSnapshotCycle } from "./alphabot.js";

const app = express();
app.use(express.json());

app.get("/", (_, res) => res.send("ok"));

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`🚀 CatBot running on ${PORT}`);
});

// start snapshot-driven worker
runSnapshotCycle();
