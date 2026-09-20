import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/rbac";
import PlanManager from "@/components/PlanManager";

export default async function SettingsPage({ params }) {
  const user = await getSessionUser();
  const membership = await getMembership(params.orgId, user.id);
  const organization = await prisma.organization.findUnique({ where: { id: params.orgId } });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Organization details and billing plan.</p>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Organization</h2>
        <p className="text-gray-800">{organization.name}</p>
        <p className="text-xs text-gray-400 mt-1">Created {new Date(organization.createdAt).toLocaleDateString()}</p>
      </div>

      {membership.role === "ADMIN" ? (
        <PlanManager orgId={params.orgId} currentPlan={organization.plan} />
      ) : (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Plan</h2>
          <p className="text-gray-800">{organization.plan}</p>
          <p className="text-xs text-gray-400 mt-2">Only Admins can change the billing plan.</p>
        </div>
      )}
    </div>
  );
}
