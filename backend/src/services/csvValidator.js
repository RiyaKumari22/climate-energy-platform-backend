
const prisma = require("../services/prisma");
const validateCSV = require("../services/csvValidator");

// =====================================================
// Validate Domain
// =====================================================

const validateDomain = (domain) => {
  const allowedDomains = [
    "CLIMATE",
    "ENERGY",
    "POWER",
  ];

  if (!allowedDomains.includes(domain)) {
    return {
      valid: false,
      message:
        "Invalid domain. Allowed domains are CLIMATE, ENERGY and POWER",
    };
  }

  return {
    valid: true,
  };
};

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
    // Check CSV file
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

    // Required fields
    if (!title || !domain || !dataType || !chartType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, domain, data type and chart type are required",
      });
    }

    // -------------------------------------------------
    // Validate Domain
    // -------------------------------------------------

    const domainValidation = validateDomain(domain);

    if (!domainValidation.valid) {
      return res.status(400).json({
        success: false,
        message: domainValidation.message,
      });
    }

    // -------------------------------------------------
    // Validate Chart Configuration
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Validate CSV
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Create Dataset
    // -------------------------------------------------

    const dataset = await prisma.dataset.create({
      data: {
        title: title.trim(),
        domain,
        dataType,
        chartType,
        description: description
          ? description.trim()
          : null,

        // Every newly uploaded dataset starts as Pending
        status: "PENDING",

        uploadedById: req.user.id,

        records: {
          create: validation.rows.map((row) => ({
            data: row,
          })),
        },
      },

      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        records: true,
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
    });
  }
};

// =====================================================
// Get All Datasets
// =====================================================

const getAllDatasets = async (req, res) => {
  try {
    /*
      SUPER_ADMIN:
      Can see every dataset.

      ADMIN:
      Can only see datasets uploaded by themselves.
    */

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
    });
  }
};

// =====================================================
// Approve Dataset
// Super Admin only
// =====================================================

const approveDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const datasetId = Number(id);

    if (!Number.isInteger(datasetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset ID",
      });
    }

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: datasetId,
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
        id: datasetId,
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
    });
  }
};

// =====================================================
// Reject Dataset
// Super Admin only
// =====================================================

const rejectDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const datasetId = Number(id);

    if (!Number.isInteger(datasetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset ID",
      });
    }

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: datasetId,
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
        id: datasetId,
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
    });
  }
};

// =====================================================
// Get Public Datasets
// Only APPROVED datasets are visible
// =====================================================

const getPublicDatasets = async (req, res) => {
  try {
    const { domain } = req.query;

    const where = {
      status: "APPROVED",
    };

    // Validate domain if supplied
    if (domain) {
      const domainValidation = validateDomain(domain);

      if (!domainValidation.valid) {
        return res.status(400).json({
          success: false,
          message: domainValidation.message,
        });
      }

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
    });
  }
};

// =====================================================
// Update Dataset
// Super Admin only
// =====================================================

const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const datasetId = Number(id);

    if (!Number.isInteger(datasetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset ID",
      });
    }

    const {
      title,
      domain,
      dataType,
      chartType,
      description,
    } = req.body;

    // Required fields
    if (!title || !domain || !dataType || !chartType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, domain, data type and chart type are required",
      });
    }

    // -------------------------------------------------
    // Validate Domain
    // -------------------------------------------------

    const domainValidation = validateDomain(domain);

    if (!domainValidation.valid) {
      return res.status(400).json({
        success: false,
        message: domainValidation.message,
      });
    }

    // -------------------------------------------------
    // Validate Chart Configuration
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Check Dataset Exists
    // -------------------------------------------------

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: datasetId,
      },

      include: {
        records: true,
      },
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    // -------------------------------------------------
    // Prevent Data Type Change Without New CSV
    // -------------------------------------------------

    if (dataset.dataType !== dataType) {
      return res.status(400).json({
        success: false,
        message:
          "Data type cannot be changed without uploading a new CSV file because the existing records use the current data type schema.",
      });
    }

    // -------------------------------------------------
    // Update Dataset Metadata
    // -------------------------------------------------

    const updatedDataset = await prisma.dataset.update({
      where: {
        id: datasetId,
      },

      data: {
        title: title.trim(),
        domain,
        dataType,
        chartType,
        description: description
          ? description.trim()
          : null,
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
    });
  }
};

// =====================================================
// Delete Dataset
// Super Admin only
// =====================================================

const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const datasetId = Number(id);

    if (!Number.isInteger(datasetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset ID",
      });
    }

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: datasetId,
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
        id: datasetId,
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