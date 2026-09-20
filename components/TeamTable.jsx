"use client";

import { useState } from "react";

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-700",
  MEMBER: "bg-blue-100 text-blue-700",
  VIEWER: "bg-gray-100 text-gray-600",
};

export default function TeamTable({ orgId, initialMembers, currentUserId, role, maxMembers }) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const isAdmin = role === "ADMIN";
  const atLimit = members.length >= maxMembers;

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/organizations/${orgId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: inviteRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMembers([...members, data]);
    setEmail("");
  }

  async function handleRoleChange(membershipId, newRole) {
    setError("");
    const res = await fetch(`/api/organizations/${orgId}/members/${membershipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMembers(members.map((m) => (m.membershipId === membershipId ? { ...m, role: newRole } : m)));
  }

  async function handleRemove(membershipId) {
    setError("");
    const res = await fetch(`/api/organizations/${orgId}/members/${membershipId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMembers(members.filter((m) => m.membershipId !== membershipId));
  }

  return (
    <div>
      {isAdmin && (
        <form onSubmit={handleInvite} className="bg-white border rounded-xl p-4 mb-6 flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Invite by email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <p className="text-xs text-gray-400 mt-1">They must already have a TeamHub account.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={atLimit}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-brand-700 transition disabled:opacity-50"
          >
            {atLimit ? "Member limit reached" : "Invite"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.membershipId} className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {m.name} {m.id === currentUserId && <span className="text-xs text-gray-400">(you)</span>}
              </p>
              <p className="text-xs text-gray-400">{m.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.membershipId, e.target.value)}
                  className={`text-xs rounded-full px-2 py-1 font-medium border-0 ${ROLE_COLORS[m.role]}`}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              ) : (
                <span className={`text-xs rounded-full px-2 py-1 font-medium ${ROLE_COLORS[m.role]}`}>{m.role}</span>
              )}
              {isAdmin && (
                <button onClick={() => handleRemove(m.membershipId)} className="text-xs text-gray-400 hover:text-red-500">
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
