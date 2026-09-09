const bcrypt = require("bcryptjs");
const prisma = require("../src/services/prisma");

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const superAdmin = await prisma.user.upsert({
    where: {
      email: "superadmin@vasudhaindia.org",
    },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      name: "Super Admin",
      email: "superadmin@vasudhaindia.org",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Super Admin created:", superAdmin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });