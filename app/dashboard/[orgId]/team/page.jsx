import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/rbac";
import { getPlanLimits } from "@/lib/plans";
import TeamTable from "@/components/TeamTable";

export default async function TeamPage({ params }) {
  const user = await getSessionUser();
  const membership = await getMembership(params.orgId, user.id);
  const organization = await prisma.organization.findUnique({ where: { id: params.orgId } });
  const limits = getPlanLimits(organization.plan);

  const memberships = await prisma.membership.findMany({
    where: { organizationId: params.orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const members = memberships.map((m) => ({ membershipId: m.id, role: m.role, ...m.user }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Team</h1>
      <p className="text-sm text-gray-500 mb-6">
        {members.length} of {limits.maxMembers === Infinity ? "unlimited" : limits.maxMembers} members on the{" "}
        {limits.label} plan.
      </p>
      <TeamTable
        orgId={params.orgId}
        initialMembers={members}
        currentUserId={user.id}
        role={membership.role}
        maxMembers={limits.maxMembers}
      />
    </div>
  );
}
