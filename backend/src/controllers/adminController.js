const bcrypt = require("bcryptjs");
const prisma = require("../services/prisma");

// Create Admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};


// Get All Admins
const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Get admins error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};


// Enable / Disable Admin
const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Only admin users can be enabled or disabled",
      });
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        isActive: !admin.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: updatedAdmin.isActive
        ? "Admin enabled successfully"
        : "Admin disabled successfully",
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle admin status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin status",
      error: error.message,
    });
  }
};


// Update Admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Only admin users can be updated here",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: Number(id),
        },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive,
        updatedAt: updatedAdmin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};


// Delete Admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Only admin users can be deleted here",
      });
    }

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};


module.exports = {
  createAdmin,
  getAdmins,
  toggleAdminStatus,
  updateAdmin,
  deleteAdmin,
};