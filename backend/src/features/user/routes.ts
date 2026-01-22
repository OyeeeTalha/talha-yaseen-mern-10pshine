import { Router } from "express";
import { getProfile, updateProfile, deactivateAccount } from "./controller.js";
import { protect } from "../../shared/middlewares/auth.js";

const router = Router();

// All user routes require authentication
router.use(protect);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.delete("/deactivate", deactivateAccount);

export default router;
