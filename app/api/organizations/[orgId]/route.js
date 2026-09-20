import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/rbac";

export async function GET(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const membership = await getMembership(params.orgId, user.id);
  if (!membership) {
    return NextResponse.json({ error: "You are not a member of this organization." }, { status: 403 });
  }

  const organization = await prisma.organization.findUnique({ where: { id: params.orgId } });
  const memberCount = await prisma.membership.count({ where: { organizationId: params.orgId } });
  const taskCount = await prisma.task.count({ where: { organizationId: params.orgId } });

  return NextResponse.json({ ...organization, myRole: membership.role, memberCount, taskCount });
}
