import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { organization: true },
  });

  return NextResponse.json(
    memberships.map((m) => ({ id: m.organization.id, name: m.organization.name, plan: m.organization.plan, role: m.role }))
  );
}

// Lets a logged-in user spin up an ADDITIONAL organization (they become its
// ADMIN). This is the "create a new tenant" flow.
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
  }

  const organization = await prisma.organization.create({
    data: {
      name: name.trim(),
      plan: "FREE",
      memberships: { create: { userId: user.id, role: "ADMIN" } },
    },
  });

  return NextResponse.json(organization, { status: 201 });
}
