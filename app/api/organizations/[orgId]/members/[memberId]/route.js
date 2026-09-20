import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireOrgRole } from "@/lib/rbac";

// Safety check used by both PATCH and DELETE below: an organization must
// always keep at least one ADMIN, otherwise nobody could manage it anymore.
async function wouldRemoveLastAdmin(organizationId, membershipId) {
  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership || membership.role !== "ADMIN") return false;

  const adminCount = await prisma.membership.count({
    where: { organizationId, role: "ADMIN" },
  });
  return adminCount <= 1;
}

// PATCH - change a member's role. ADMIN only.
export async function PATCH(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "ADMIN");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const { role } = await request.json();
  if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (role !== "ADMIN" && (await wouldRemoveLastAdmin(params.orgId, params.memberId))) {
    return NextResponse.json({ error: "An organization must have at least one Admin." }, { status: 400 });
  }

  const updated = await prisma.membership.update({
    where: { id: params.memberId },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ membershipId: updated.id, role: updated.role, ...updated.user });
}

// DELETE - remove a member from the organization. ADMIN only.
export async function DELETE(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "ADMIN");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  if (await wouldRemoveLastAdmin(params.orgId, params.memberId)) {
    return NextResponse.json({ error: "An organization must have at least one Admin." }, { status: 400 });
  }

  await prisma.membership.delete({ where: { id: params.memberId } });
  return NextResponse.json({ ok: true });
}
