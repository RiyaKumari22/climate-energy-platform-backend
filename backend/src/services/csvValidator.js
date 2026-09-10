const Papa = require("papaparse");

// =====================================================
// CSV Validator
// =====================================================

const validateCSV = (buffer, dataType) => {
  try {
    // -------------------------------------------------
    // Basic file validation
    // -------------------------------------------------

    if (!buffer || buffer.length === 0) {
      return {
        valid: false,
        message: "CSV file is empty",
        errors: [],
      };
    }

    // -------------------------------------------------
    // Parse CSV
    // -------------------------------------------------

    const csvText = buffer.toString("utf8");

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    // -------------------------------------------------
    // Check PapaParse errors
    // -------------------------------------------------

    if (parsed.errors && parsed.errors.length > 0) {
      return {
        valid: false,
        message: "CSV contains malformed data",
        errors: parsed.errors.map((error) => ({
          row: error.row,
          message: error.message,
        })),
      };
    }

    // -------------------------------------------------
    // Check rows
    // -------------------------------------------------

    if (!parsed.data || parsed.data.length === 0) {
      return {
        valid: false,
        message: "CSV file contains no data rows",
        errors: [],
      };
    }

    // -------------------------------------------------
    // Check headers
    // -------------------------------------------------

    const headers = parsed.meta.fields || [];

    if (headers.length === 0) {
      return {
        valid: false,
        message: "CSV file does not contain valid column headers",
        errors: [],
      };
    }

    // Remove spaces from header names for validation
    const normalizedHeaders = headers.map((header) =>
      String(header).trim().toLowerCase()
    );

    // -------------------------------------------------
    // Required columns based on data type
    // -------------------------------------------------

    const requiredColumns = {
      LATLONG: ["latitude", "longitude", "value"],
      STATE: ["state", "value"],
      TIMESERIES: ["year", "value"],
    };

    if (!requiredColumns[dataType]) {
      return {
        valid: false,
        message: "Invalid data type",
        errors: [],
      };
    }

    const missingColumns = requiredColumns[dataType].filter(
      (column) => !normalizedHeaders.includes(column)
    );

    if (missingColumns.length > 0) {
      return {
        valid: false,
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        errors: missingColumns,
      };
    }

    // -------------------------------------------------
    // Validate each row
    // -------------------------------------------------

    const errors = [];

    parsed.data.forEach((row, index) => {
      const rowNumber = index + 2; // Header = row 1

      // -----------------------------------------------
      // LATLONG
      // -----------------------------------------------

      if (dataType === "LATLONG") {
        const latitude = Number(row.latitude);
        const longitude = Number(row.longitude);
        const value = Number(row.value);

        if (!Number.isFinite(latitude)) {
          errors.push(
            `Row ${rowNumber}: latitude must be a valid number`
          );
        } else if (latitude < 6 || latitude > 38) {
          errors.push(
            `Row ${rowNumber}: latitude must be between 6 and 38`
          );
        }

        if (!Number.isFinite(longitude)) {
          errors.push(
            `Row ${rowNumber}: longitude must be a valid number`
          );
        } else if (longitude < 68 || longitude > 98) {
          errors.push(
            `Row ${rowNumber}: longitude must be between 68 and 98`
          );
        }

        if (!Number.isFinite(value)) {
          errors.push(
            `Row ${rowNumber}: value must be a valid number`
          );
        }
      }

      // -----------------------------------------------
      // STATE
      // -----------------------------------------------

      if (dataType === "STATE") {
        const state =
          row.state !== undefined && row.state !== null
            ? String(row.state).trim()
            : "";

        const value = Number(row.value);

        if (!state) {
          errors.push(
            `Row ${rowNumber}: state is required`
          );
        }

        if (!Number.isFinite(value)) {
          errors.push(
            `Row ${rowNumber}: value must be a valid number`
          );
        }
      }

      // -----------------------------------------------
      // TIMESERIES
      // -----------------------------------------------

      if (dataType === "TIMESERIES") {
        const year = Number(row.year);
        const value = Number(row.value);

        if (!Number.isFinite(year)) {
          errors.push(
            `Row ${rowNumber}: year must be a valid number`
          );
        } else if (year < 1900 || year > 2100) {
          errors.push(
            `Row ${rowNumber}: year must be between 1900 and 2100`
          );
        }

        if (!Number.isFinite(value)) {
          errors.push(
            `Row ${rowNumber}: value must be a valid number`
          );
        }
      }
    });

    // -------------------------------------------------
    // Return validation errors
    // -------------------------------------------------

    if (errors.length > 0) {
      return {
        valid: false,
        message: "CSV validation failed",
        errors,
      };
    }

    // -------------------------------------------------
    // Return successful validation
    // -------------------------------------------------

    return {
      valid: true,
      message: "CSV validated successfully",
      rows: parsed.data,
    };
  } catch (error) {
    console.error("CSV validation error:", error);

    return {
      valid: false,
      message: "Failed to validate CSV file",
      errors: [error.message],
    };
  }
};

// =====================================================
// Export
// =====================================================

module.exports = validateCSV;