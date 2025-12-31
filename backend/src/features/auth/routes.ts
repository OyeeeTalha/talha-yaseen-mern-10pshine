import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import { userAuthSchema } from "./schema.js";
import { UserModel } from "../../models/User.js";

import { ExpressAuth } from "@auth/express";
import { authConfig } from "./config.js";


// This is the actual "Route" part



const router = Router();

router.all("*", ExpressAuth(authConfig));

export default router;
