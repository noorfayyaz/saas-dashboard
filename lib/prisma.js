// Next.js reloads modules a lot during development, which can create tons
// of separate database connections if we're not careful. This pattern
// (storing the client on `global`) makes sure we only ever create ONE.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
