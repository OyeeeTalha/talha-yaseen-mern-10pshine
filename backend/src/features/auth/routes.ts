import { Router } from "express";

import { ExpressAuth } from "@auth/express";
import { authConfig } from "./config.js";

const router = Router();

router.all("*", ExpressAuth(authConfig));

export default router;
