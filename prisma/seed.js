// Fills the database with demo data so you don't start with an empty app.
// Run with: npm run seed

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Three demo users, one for each role, so you can log in and see how the
  // UI changes depending on permission level.
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: { name: "Alex Admin", email: "admin@demo.com", passwordHash },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: { name: "Mia Member", email: "member@demo.com", passwordHash },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@demo.com" },
    update: {},
    create: { name: "Val Viewer", email: "viewer@demo.com", passwordHash },
  });

  const org = await prisma.organization.upsert({
    where: { id: "demo-org-seed-id" },
    update: {},
    create: { id: "demo-org-seed-id", name: "Acme Inc.", plan: "FREE" },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: admin.id, organizationId: org.id } },
    update: { role: "ADMIN" },
    create: { userId: admin.id, organizationId: org.id, role: "ADMIN" },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: member.id, organizationId: org.id } },
    update: { role: "MEMBER" },
    create: { userId: member.id, organizationId: org.id, role: "MEMBER" },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: viewer.id, organizationId: org.id } },
    update: { role: "VIEWER" },
    create: { userId: viewer.id, organizationId: org.id, role: "VIEWER" },
  });

  // Spread some tasks over the last 14 days so the "tasks over time" chart
  // has something interesting to show.
  const statuses = ["TODO", "IN_PROGRESS", "DONE"];
  const titles = [
    "Design landing page",
    "Fix login bug",
    "Write onboarding email",
    "Set up analytics",
    "Review pull request",
    "Plan sprint",
    "Customer call notes",
    "Update pricing page",
    "Refactor auth module",
    "Prepare demo",
  ];

  const existingTasks = await prisma.task.count({ where: { organizationId: org.id } });
  if (existingTasks === 0) {
    for (let i = 0; i < 24; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await prisma.task.create({
        data: {
          title: titles[i % titles.length],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          organizationId: org.id,
          createdBy: admin.id,
          createdAt,
        },
      });
    }
  }

  console.log("Seeded demo data successfully.");
  console.log("Log in with any of these (password: password123):");
  console.log("  admin@demo.com  -> ADMIN");
  console.log("  member@demo.com -> MEMBER");
  console.log("  viewer@demo.com -> VIEWER");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
