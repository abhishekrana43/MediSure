import Medicine from "../models/medicine.js";
import { parse } from "csv-parse/sync";

export const createMedicine = async (req, res) => {
  try {
    const {
      medicineId,
      name,
      manufacturer,
      batchNumber,
      serialNumber,
      manufacturingDate,
      expiryDate,
    } = req.body ?? {};

    // Validate required fields
    const requiredFields = {
      medicineId,
      name,
      manufacturer,
      batchNumber,
      serialNumber,
      manufacturingDate,
      expiryDate,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (
        typeof value !== "string" ||
        value.trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required and must be a non-empty string`,
        });
      }
    }

    // Parse and validate dates
    const manufacturing = new Date(manufacturingDate);
    const expiry = new Date(expiryDate);

    if (
      Number.isNaN(manufacturing.getTime()) ||
      Number.isNaN(expiry.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Manufacturing date and expiry date must be valid dates",
      });
    }

    if (expiry <= manufacturing) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after the manufacturing date",
      });
    }

    // Prevent clients from setting protected or unexpected fields
    const medicineData = {
      medicineId: medicineId.trim(),
      name: name.trim(),
      manufacturer: manufacturer.trim(),
      batchNumber: batchNumber.trim(),
      serialNumber: serialNumber.trim(),
      manufacturingDate: manufacturing,
      expiryDate: expiry,
    };

    const medicine = await Medicine.create(medicineData);

    return res.status(201).json({
      success: true,
      message: "Medicine registered successfully",
      data: medicine,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Medicine ID or serial number already exists",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine data",
      });
    }

    console.error("Medicine registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while registering the medicine",
    });
  }
};


export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMedicineBySerial = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      serialNumber: req.params.serialNumber,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




//import { parse } from "csv-parse/sync";

// Bulk-import individual medicine pack records from CSV.
// Required CSV columns:
// medicineId,name,manufacturer,batchNumber,serialNumber,
// manufacturingDate,expiryDate
export const bulkImportMedicines = async (req, res) => {
  try {
    if (typeof req.body?.csv !== "string" || !req.body.csv.trim()) {
      return res.status(400).json({
        success: false,
        message: "Provide CSV content in the 'csv' field",
      });
    }

    const records = parse(req.body.csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      max_record_size: 10_000,
    });

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The CSV contains no data rows",
      });
    }

    // Keep imports bounded to avoid oversized requests.
    if (records.length > 500) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 500 medicine records can be imported at once",
      });
    }

    const requiredFields = [
      "medicineId",
      "name",
      "manufacturer",
      "batchNumber",
      "serialNumber",
      "manufacturingDate",
      "expiryDate",
    ];

    const normalized = [];
    const errors = [];
    const seenMedicineIds = new Set();
    const seenSerialNumbers = new Set();

    const parseDate = (value) => {
      // Require ISO date-only format: YYYY-MM-DD.
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        return null;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return null;
      }

      return date;
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2;
      const rowErrors = [];

      for (const field of requiredFields) {
        if (
          typeof row[field] !== "string" ||
          row[field].trim() === ""
        ) {
          rowErrors.push(`${field} is required`);
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
        continue;
      }

      const medicineId = row.medicineId.trim();
      const serialNumber = row.serialNumber.trim();

      if (seenMedicineIds.has(medicineId)) {
        rowErrors.push("Duplicate medicineId within CSV");
      }
      if (seenSerialNumbers.has(serialNumber)) {
        rowErrors.push("Duplicate serialNumber within CSV");
      }

      seenMedicineIds.add(medicineId);
      seenSerialNumbers.add(serialNumber);

      const manufacturingDate = parseDate(row.manufacturingDate);
      const expiryDate = parseDate(row.expiryDate);

      if (!manufacturingDate) {
        rowErrors.push("manufacturingDate must use YYYY-MM-DD");
      }
      if (!expiryDate) {
        rowErrors.push("expiryDate must use YYYY-MM-DD");
      }
      if (
        manufacturingDate &&
        expiryDate &&
        expiryDate <= manufacturingDate
      ) {
        rowErrors.push("expiryDate must be after manufacturingDate");
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
        continue;
      }

      normalized.push({
        medicineId,
        name: row.name.trim(),
        manufacturer: row.manufacturer.trim(),
        batchNumber: row.batchNumber.trim(),
        serialNumber,
        manufacturingDate,
        expiryDate,
      });
    }

    // Atomic validation policy: if any row is invalid, import nothing.
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "CSV validation failed; no records were imported",
        invalidRows: errors,
      });
    }

    // Check existing database identifiers before insertion.
    const medicineIds = normalized.map((row) => row.medicineId);
    const serialNumbers = normalized.map((row) => row.serialNumber);

    const existing = await Medicine.find({
      $or: [
        { medicineId: { $in: medicineIds } },
        { serialNumber: { $in: serialNumbers } },
      ],
    })
      .select("medicineId serialNumber")
      .lean();

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some medicine IDs or serial numbers already exist",
        conflicts: existing.map(({ medicineId, serialNumber }) => ({
          medicineId,
          serialNumber,
        })),
        imported: 0,
      });
    }

    // Unique indexes remain the final protection against concurrent imports.
    const inserted = await Medicine.insertMany(normalized, {
      ordered: true,
    });

    return res.status(201).json({
      success: true,
      message: "Medicine stock imported successfully",
      imported: inserted.length,
      data: inserted,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A medicine ID or serial number already exists",
        imported: 0,
      });
    }

    if (error.name === "CsvError") {
      return res.status(400).json({
        success: false,
        message: "The CSV format is invalid",
      });
    }

    console.error("Bulk medicine import error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to import medicine stock",
    });
  }
};
