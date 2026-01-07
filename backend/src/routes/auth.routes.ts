import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { requireAuth, AuthRequest } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// token test endpoint
router.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
