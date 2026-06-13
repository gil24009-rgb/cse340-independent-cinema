import express from "express";

import {
  showMemberAccount,
  showOwnerAccount,
  showStaffAccount,
} from "../controllers/accountController.js";
import { requireRole } from "../middleware/authentication.js";

const router = express.Router();

router.get("/account", requireRole("member"), showMemberAccount);
router.get("/staff", requireRole("staff", "owner"), showStaffAccount);
router.get("/admin", requireRole("owner"), showOwnerAccount);

export default router;
