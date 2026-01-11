import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "barber@demo.com";
  const password = "123456";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "BARBER",
      // zorunlu alanlar update tarafında da dursun (istersen kaldırabilirsin)
      surname: "Demo",
      phoneNumber: "5000000000",
    },
    create: {
      name: "Demo Barber",
      surname: "Demo",
      phoneNumber: "5000000000",
      email,
      passwordHash,
      role: "BARBER",
    },
  });

  console.log("Seed OK -> barber@demo.com / 123456 (ROLE: BARBER)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
