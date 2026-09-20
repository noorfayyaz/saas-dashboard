// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC)
//
// Every organization member has exactly one role: ADMIN, MEMBER, or VIEWER.
// Rather than sprinkling `if (role === "ADMIN" || role === "MEMBER")` all
// over the codebase, we rank the roles and ask "does this role meet the
// MINIMUM required level for this action?" - much easier to read and to
// change later.
// ---------------------------------------------------------------------------

import prisma from "./prisma";

export const ROLE_RANK = { VIEWER: 0, MEMBER: 1, ADMIN: 2 };

export function hasMinimumRole(role, minimumRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

// Looks up whether `userId` belongs to `organizationId`, and with what role.
// Returns the Membership row, or null if they're not a member at all
// (this is the core multi-tenancy check: no membership = no access,
// regardless of what the URL says).
export async function getMembership(organizationId, userId) {
  if (!organizationId || !userId) return null;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
}

// Convenience helper for Route Handlers: checks membership + minimum role
// in one call, and returns a ready-to-use error response if it fails.
export async function requireOrgRole(organizationId, userId, minimumRole) {
  const membership = await getMembership(organizationId, userId);
  if (!membership) {
    return { ok: false, status: 403, message: "You are not a member of this organization." };
  }
  if (!hasMinimumRole(membership.role, minimumRole)) {
    return { ok: false, status: 403, message: `This action requires the ${minimumRole} role or higher.` };
  }
  return { ok: true, membership };
}
