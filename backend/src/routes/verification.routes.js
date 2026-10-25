import express from "express";

import {
  verifyMedicineController,
} from "../controllers/verification.controller.js";

const router = express.Router();

router.post("/", verifyMedicineController);

export default router;