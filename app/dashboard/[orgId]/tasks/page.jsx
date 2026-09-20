import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/rbac";
import TaskBoard from "@/components/TaskBoard";

export default async function TasksPage({ params }) {
  const user = await getSessionUser();
  const membership = await getMembership(params.orgId, user.id);

  const tasks = await prisma.task.findMany({
    where: { organizationId: params.orgId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Tasks</h1>
      <p className="text-sm text-gray-500 mb-6">
        {membership.role === "VIEWER"
          ? "You have read-only access to this list."
          : "Create and update tasks for your team."}
      </p>
      <TaskBoard orgId={params.orgId} initialTasks={tasks} role={membership.role} />
    </div>
  );
}
