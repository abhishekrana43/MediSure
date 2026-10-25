import express from "express";

import {
  getAllScans,
  getScansBySerial,
} from "../controllers/scan.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  authorize("ADMIN", "MANUFACTURER"),
  getAllScans
);

router.get(
  "/serial/:serialNumber",
  authorize("ADMIN", "MANUFACTURER", "PHARMACIST"),
  getScansBySerial
);

export default router;