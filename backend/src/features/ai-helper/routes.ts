import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { handleAIRequest, handleDailyQuoteRequest } from "./controller.js";

const router = Router();

router.use(protect); // Ensure user is logged in

router.post("/assist", handleAIRequest);
router.get("/daily-quote", handleDailyQuoteRequest);

export default router;
