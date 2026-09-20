import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/rbac";
import { getPlanLimits } from "@/lib/plans";
import Sidebar from "@/components/Sidebar";

export default async function OrgDashboardLayout({ children, params }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Core multi-tenancy guard: if this user isn't a member of the org in
  // the URL, they get bounced out - no peeking at someone else's tenant
  // by editing the URL.
  const membership = await getMembership(params.orgId, user.id);
  if (!membership) redirect("/dashboard");

  const organization = await prisma.organization.findUnique({ where: { id: params.orgId } });

  const allMemberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { organization: true },
  });
  const organizations = allMemberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    role: m.role,
  }));

  const limits = getPlanLimits(organization.plan);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        currentOrgId={params.orgId}
        organizations={organizations}
        userName={user.name}
        role={membership.role}
        planLabel={limits.label}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
