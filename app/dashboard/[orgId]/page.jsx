import { getAnalyticsForOrg } from "@/lib/analytics";
import StatusPieChart from "@/components/charts/StatusPieChart";
import TasksOverTimeChart from "@/components/charts/TasksOverTimeChart";
import LockedFeatureCard from "@/components/LockedFeatureCard";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default async function OverviewPage({ params }) {
  const analytics = await getAnalyticsForOrg(params.orgId);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
      <p className="text-sm text-gray-500 mb-6">Snapshot of your team&apos;s activity.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Team members" value={analytics.memberCount} />
        <StatCard label="Total tasks" value={analytics.taskCount} />
        <StatCard label="Current plan" value={analytics.planLabel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Tasks by status</h2>
          <StatusPieChart data={analytics.statusBreakdown} />
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Tasks created (last 14 days)</h2>
          {analytics.advancedAnalyticsLocked ? (
            <LockedFeatureCard orgId={params.orgId} title="Trend analytics" />
          ) : (
            <TasksOverTimeChart data={analytics.tasksOverTime} />
          )}
        </div>
      </div>
    </div>
  );
}
