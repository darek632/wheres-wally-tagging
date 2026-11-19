// const { Router } = require("express");
import {Router} from "express";
import path from "node:path";
import * as wallyController  from "../controllers/wallyController.js"
const wallyRouter = Router();


wallyRouter.get("/", (req, res) => res.json({ status: "ok" }));

wallyRouter.get("/image", wallyController.getImage);
wallyRouter.post("/games", wallyController.postGame);

wallyRouter.post("/games/:gameId/guess", wallyController.postGuess);
wallyRouter.post("/games/:gameId/score", wallyController.postScore);
wallyRouter.get("/leaderboard", wallyController.getLeaderboard);


export default wallyRouter;