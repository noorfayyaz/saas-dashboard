import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireOrgRole } from "@/lib/rbac";
import { getPlanLimits } from "@/lib/plans";

// GET - anyone who is a member (even VIEWER) can see the team list.
export async function GET(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "VIEWER");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const memberships = await prisma.membership.findMany({
    where: { organizationId: params.orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    memberships.map((m) => ({ membershipId: m.id, role: m.role, ...m.user }))
  );
}

// POST - invite an EXISTING registered user into this organization.
// (There's no email service here, so the person must already have a
// TeamHub account - this mirrors how a lot of internal tools work.)
// Only ADMINs can do this, and it respects the plan's max-member limit.
export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "ADMIN");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const { email, role } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const organization = await prisma.organization.findUnique({ where: { id: params.orgId } });
  const limits = getPlanLimits(organization.plan);
  const currentMemberCount = await prisma.membership.count({ where: { organizationId: params.orgId } });

  if (currentMemberCount >= limits.maxMembers) {
    return NextResponse.json(
      { error: `Your ${limits.label} plan allows up to ${limits.maxMembers} members. Upgrade your plan to invite more.` },
      { status: 403 }
    );
  }

  const invitedUser = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!invitedUser) {
    return NextResponse.json(
      { error: "No TeamHub account found with that email. Ask them to sign up first, then invite them." },
      { status: 404 }
    );
  }

  const existingMembership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: invitedUser.id, organizationId: params.orgId } },
  });
  if (existingMembership) {
    return NextResponse.json({ error: "This person is already a member." }, { status: 409 });
  }

  const membership = await prisma.membership.create({
    data: { userId: invitedUser.id, organizationId: params.orgId, role: role || "MEMBER" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(
    { membershipId: membership.id, role: membership.role, ...membership.user },
    { status: 201 }
  );
}
