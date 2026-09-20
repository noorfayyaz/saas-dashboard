import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireOrgRole } from "@/lib/rbac";

// This is a MOCK billing flow for the assignment - it just updates the
// plan field directly. In a real product, this route would instead create
// a Stripe Checkout Session and only update the plan after a successful
// payment webhook (see the e-commerce task's Stripe webhook for that
// pattern - the same idea applies here).
export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "ADMIN");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const { plan } = await request.json();
  if (!["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const organization = await prisma.organization.update({
    where: { id: params.orgId },
    data: { plan },
  });

  return NextResponse.json(organization);
}
