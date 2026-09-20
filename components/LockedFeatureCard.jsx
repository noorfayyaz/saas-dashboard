import Link from "next/link";

export default function LockedFeatureCard({ orgId, title }) {
  return (
    <div className="relative border rounded-xl bg-white overflow-hidden">
      <div className="h-64 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-gray-50 to-gray-100">
        <span className="text-3xl">🔒</span>
        <p className="text-sm font-medium text-gray-600">{title} is a Pro feature</p>
        <Link
          href={`/dashboard/${orgId}/settings`}
          className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-lg hover:bg-brand-700 transition"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
