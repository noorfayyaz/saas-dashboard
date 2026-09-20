// ---------------------------------------------------------------------------
// This one config object drives ALL feature gating in the app.
// To add a new plan tier or change a limit, you only ever edit this file.
// ---------------------------------------------------------------------------

export const PLAN_LIMITS = {
  FREE: {
    label: "Free",
    maxMembers: 3,
    maxTasks: 20,
    advancedAnalytics: false,
    price: "$0/mo",
  },
  PRO: {
    label: "Pro",
    maxMembers: 20,
    maxTasks: 500,
    advancedAnalytics: true,
    price: "$29/mo",
  },
  ENTERPRISE: {
    label: "Enterprise",
    maxMembers: Infinity,
    maxTasks: Infinity,
    advancedAnalytics: true,
    price: "Contact us",
  },
};

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}
