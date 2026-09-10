
const prisma = require("../services/prisma");
const validateCSV = require("../services/csvValidator");

// =====================================================
// Validate Data Type + Chart Type
// =====================================================

const validateChartConfiguration = (dataType, chartType) => {
  const allowedCharts = {
    LATLONG: ["MAP"],
    STATE: ["HEATMAP"],
    TIMESERIES: ["LINE", "BAR", "AREA"],
  };

  if (!allowedCharts[dataType]) {
    return {
      valid: false,
      message: "Invalid data type",
    };
  }

  if (!allowedCharts[dataType].includes(chartType)) {
    return {
      valid: false,
      message: `Invalid chart type for ${dataType}`,
    };
  }

  return {
    valid: true,
  };
};


// =====================================================
// Upload Dataset
// =====================================================

const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const {
      title,
      domain,
      dataType,
      chartType,
      description,
    } = req.body;

    if (!title || !domain || !dataType || !chartType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, domain, data type and chart type are required",
      });
    }

    // Validate chart configuration
    const chartValidation = validateChartConfiguration(
      dataType,
      chartType
    );

    if (!chartValidation.valid) {
      return res.status(400).json({
        success: false,
        message: chartValidation.message,
      });
    }

    // Validate CSV
    const validation = validateCSV(
      req.file.buffer,
      dataType
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors || [],
      });
    }

    const dataset = await prisma.dataset.create({
      data: {
        title,
        domain,
        dataType,
        chartType,
        description: description || null,
        status: "PENDING",
        uploadedById: req.user.id,

        records: {
          create: validation.rows.map((row) => ({
            data: row,
          })),
        },
      },

      include: {
        records: true,

        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Dataset uploaded successfully and is pending approval",
      dataset,
    });
  } catch (error) {
    console.error("Upload dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload dataset",
      error: error.message,
    });
  }
};


// =====================================================
// Get All Datasets - Admin / Super Admin
// =====================================================

const getAllDatasets = async (req, res) => {
  try {
    // Super Admin can see all datasets.
    // Normal Admin can only see datasets they uploaded.
    const where =
      req.user.role === "SUPER_ADMIN"
        ? {}
        : {
            uploadedById: req.user.id,
          };

    const datasets = await prisma.dataset.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        records: true,
      },
    });

    return res.status(200).json({
      success: true,
      datasets,
    });
  } catch (error) {
    console.error("Get datasets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch datasets",
      error: error.message,
    });
  }
};


// =====================================================
// Approve Dataset - Super Admin
// =====================================================

const approveDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    const updatedDataset = await prisma.dataset.update({
      where: {
        id: Number(id),
      },

      data: {
        status: "APPROVED",
        approvedById: req.user.id,
        publishedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Dataset approved successfully",
      dataset: updatedDataset,
    });
  } catch (error) {
    console.error("Approve dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve dataset",
      error: error.message,
    });
  }
};


// =====================================================
// Reject Dataset - Super Admin
// =====================================================

const rejectDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    const updatedDataset = await prisma.dataset.update({
      where: {
        id: Number(id),
      },

      data: {
        status: "REJECTED",
        approvedById: null,
        publishedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Dataset rejected successfully",
      dataset: updatedDataset,
    });
  } catch (error) {
    console.error("Reject dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject dataset",
      error: error.message,
    });
  }
};


// =====================================================
// Get Public Approved Datasets
// =====================================================

const getPublicDatasets = async (req, res) => {
  try {
    const { domain } = req.query;

    const where = {
      status: "APPROVED",
    };

    if (domain) {
      where.domain = domain;
    }

    const datasets = await prisma.dataset.findMany({
      where,

      orderBy: {
        publishedAt: "desc",
      },

      include: {
        records: true,
      },
    });

    return res.status(200).json({
      success: true,
      datasets,
    });
  } catch (error) {
    console.error("Get public datasets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public datasets",
      error: error.message,
    });
  }
};


// =====================================================
// Update Dataset - Super Admin
// =====================================================

const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      domain,
      dataType,
      chartType,
      description,
    } = req.body;

    if (!title || !domain || !dataType || !chartType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, domain, data type and chart type are required",
      });
    }

    // Validate chart configuration
    const chartValidation = validateChartConfiguration(
      dataType,
      chartType
    );

    if (!chartValidation.valid) {
      return res.status(400).json({
        success: false,
        message: chartValidation.message,
      });
    }

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    const updatedDataset = await prisma.dataset.update({
      where: {
        id: Number(id),
      },

      data: {
        title,
        domain,
        dataType,
        chartType,
        description: description || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Dataset updated successfully",
      dataset: updatedDataset,
    });
  } catch (error) {
    console.error("Update dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update dataset",
      error: error.message,
    });
  }
};


// =====================================================
// Delete Dataset - Super Admin
// =====================================================

const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    await prisma.dataset.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    console.error("Delete dataset error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete dataset",
      error: error.message,
    });
  }
};


// =====================================================
// Export Controllers
// =====================================================

module.exports = {
  uploadDataset,
  getAllDatasets,
  approveDataset,
  rejectDataset,
  getPublicDatasets,
  updateDataset,
  deleteDataset,
};