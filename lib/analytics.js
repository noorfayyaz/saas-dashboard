import prisma from "./prisma";
import { getPlanLimits } from "./plans";

export async function getAnalyticsForOrg(organizationId) {
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  const limits = getPlanLimits(organization.plan);

  const memberCount = await prisma.membership.count({ where: { organizationId } });
  const tasks = await prisma.task.findMany({
    where: { organizationId },
    select: { status: true, createdAt: true },
  });

  const statusBreakdown = [
    { name: "To Do", value: tasks.filter((t) => t.status === "TODO").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS").length },
    { name: "Done", value: tasks.filter((t) => t.status === "DONE").length },
  ];

  let tasksOverTime = null;
  if (limits.advancedAnalytics) {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = tasks.filter((t) => new Date(t.createdAt).toDateString() === day.toDateString()).length;
      days.push({ date: label, tasks: count });
    }
    tasksOverTime = days;
  }

  return {
    plan: organization.plan,
    planLabel: limits.label,
    memberCount,
    taskCount: tasks.length,
    statusBreakdown,
    tasksOverTime,
    advancedAnalyticsLocked: !limits.advancedAnalytics,
  };
}
