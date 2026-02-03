import express from "express";
import { handleContactSubmission, handleWaitlistSubmission } from "./controller.js";

const router = express.Router();

// POST /contact
router.post("/contact", handleContactSubmission);

// POST /waitlist
router.post("/waitlist", handleWaitlistSubmission);

export default router;
