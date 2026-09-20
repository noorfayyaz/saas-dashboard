import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireOrgRole } from "@/lib/rbac";

// PATCH - update a task's status/title. Requires MEMBER or ADMIN.
export async function PATCH(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "MEMBER");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const body = await request.json();
  const data = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.status !== undefined) data.status = body.status;

  const task = await prisma.task.update({
    where: { id: params.taskId },
    data,
  });

  return NextResponse.json(task);
}

// DELETE - requires MEMBER or ADMIN.
export async function DELETE(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "MEMBER");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  await prisma.task.delete({ where: { id: params.taskId } });
  return NextResponse.json({ ok: true });
}
