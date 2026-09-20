"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-700",
  MEMBER: "bg-blue-100 text-blue-700",
  VIEWER: "bg-gray-100 text-gray-600",
};

export default function Sidebar({ currentOrgId, organizations, userName, role, planLabel }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitchOrg(e) {
    router.push(`/dashboard/${e.target.value}`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: `/dashboard/${currentOrgId}`, label: "Overview", exact: true },
    { href: `/dashboard/${currentOrgId}/tasks`, label: "Tasks" },
    { href: `/dashboard/${currentOrgId}/team`, label: "Team" },
    { href: `/dashboard/${currentOrgId}/settings`, label: "Settings", adminOnly: true },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r flex flex-col">
      <div className="px-5 py-4 border-b">
        <h1 className="font-bold text-lg text-gray-900">TeamHub</h1>
        <p className="text-xs text-gray-400">Multi-tenant SaaS dashboard</p>
      </div>

      <div className="px-5 py-4 border-b">
        <label className="block text-xs font-medium text-gray-400 mb-1">Organization</label>
        <select
          value={currentOrgId}
          onChange={handleSwitchOrg}
          className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>{role}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
            {planLabel} plan
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && role !== "ADMIN") return null;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t">
        <p className="text-sm font-medium text-gray-700 truncate">{userName}</p>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 mt-1">
          Log out
        </button>
      </div>
    </aside>
  );
}
