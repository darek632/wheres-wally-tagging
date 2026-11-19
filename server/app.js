// require("dotenv").config();
import "dotenv/config";
// const express = require("express");
import express from "express";
// const cors = require("cors");

import cors from "cors";

import wallyRouter from "./routes/wallyRouter.js";

const app = express();

app.use(cors({origin: process.env.CLIENT_URL ||  "http://localhost:5173"})) // where the vite front end lives locally
app.use(express.json());
app.use("/api", wallyRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

 const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
