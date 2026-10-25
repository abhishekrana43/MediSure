
import Scan from "../models/Scan.js";

const parsePagination = (query) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    return null;
  }

  return { page, limit, skip: (page - 1) * limit };
};

const medicineFields = "medicineId name manufacturer batchNumber";
const userFields = "name email role";

// Get all scans with pagination
export const getAllScans = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);

    if (!pagination) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const { page, limit, skip } = pagination;

    const [scans, total] = await Promise.all([
      Scan.find()
        .populate("medicine", medicineFields)
        .populate("scannedBy", userFields)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Scan.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      count: scans.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: scans,
    });
  } catch (error) {
    console.error("Get scans error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve scan history",
    });
  }
};

// Get scan history by serial number with pagination
export const getScansBySerial = async (req, res) => {
  try {
    const serialNumber = req.params.serialNumber?.trim();

    if (!serialNumber || serialNumber.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid serial number is required",
      });
    }

    const pagination = parsePagination(req.query);

    if (!pagination) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const { page, limit, skip } = pagination;

    const filter = { serialNumber };

    const [scans, total] = await Promise.all([
      Scan.find(filter)
        .populate("medicine", medicineFields)
        .populate("scannedBy", userFields)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Scan.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: scans.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: scans,
    });
  } catch (error) {
    console.error("Get serial scans error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve scan history",
    });
  }
};
