import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireOrgRole } from "@/lib/rbac";
import { getPlanLimits } from "@/lib/plans";

// GET - any org member (including VIEWER) can see tasks.
export async function GET(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "VIEWER");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const tasks = await prisma.task.findMany({
    where: { organizationId: params.orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

// POST - create a task. Requires MEMBER or ADMIN (VIEWER is read-only).
// Also respects the plan's max-task limit (feature gating).
export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "MEMBER");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const { title } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Task title is required." }, { status: 400 });
  }

  const organization = await prisma.organization.findUnique({ where: { id: params.orgId } });
  const limits = getPlanLimits(organization.plan);
  const currentTaskCount = await prisma.task.count({ where: { organizationId: params.orgId } });

  if (currentTaskCount >= limits.maxTasks) {
    return NextResponse.json(
      { error: `Your ${limits.label} plan allows up to ${limits.maxTasks} tasks. Upgrade your plan to add more.` },
      { status: 403 }
    );
  }

  const task = await prisma.task.create({
    data: { title: title.trim(), organizationId: params.orgId, createdBy: user.id },
  });

  return NextResponse.json(task, { status: 201 });
}
