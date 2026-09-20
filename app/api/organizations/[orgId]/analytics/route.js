import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { requireOrgRole } from "@/lib/rbac";
import { getAnalyticsForOrg } from "@/lib/analytics";

export async function GET(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const access = await requireOrgRole(params.orgId, user.id, "VIEWER");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const analytics = await getAnalyticsForOrg(params.orgId);
  return NextResponse.json(analytics);
}
