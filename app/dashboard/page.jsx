import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import CreateOrgForm from "@/components/CreateOrgForm";

export default async function DashboardIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    redirect(`/dashboard/${membership.organizationId}`);
  }

  // Edge case: a user with zero organizations (shouldn't normally happen
  // since registering creates one automatically, but they could have left
  // their only org). Let them create a new one.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Create an organization</h1>
        <p className="text-sm text-gray-500 mb-6">You don&apos;t belong to any team yet.</p>
        <CreateOrgForm />
      </div>
    </div>
  );
}
