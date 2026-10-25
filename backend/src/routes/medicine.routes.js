import express from "express";
import {protect} from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createMedicine,
  getMedicines,
  getMedicineBySerial,
  bulkImportMedicines,
} from "../controllers/medicine.controller.js";



const router = express.Router();

router.post("/",protect, authorize("ADMIN", "MANUFACTURER"), createMedicine);

router.get("/", getMedicines);

router.post(
  "/bulk-import",
  protect,
  authorize("ADMIN", "MANUFACTURER"),
  bulkImportMedicines
);

router.get("/:serialNumber", getMedicineBySerial);

export default router;