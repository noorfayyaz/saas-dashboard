"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  { id: "FREE", label: "Free", price: "$0/mo", features: ["Up to 3 members", "Up to 20 tasks", "Basic analytics"] },
  { id: "PRO", label: "Pro", price: "$29/mo", features: ["Up to 20 members", "Up to 500 tasks", "Advanced analytics"] },
  {
    id: "ENTERPRISE",
    label: "Enterprise",
    price: "Contact us",
    features: ["Unlimited members", "Unlimited tasks", "Advanced analytics"],
  },
];

export default function PlanManager({ orgId, currentPlan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function handleChangePlan(planId) {
    setError("");
    setLoading(planId);
    try {
      const res = await fetch(`/api/organizations/${orgId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-1">Billing plan</h2>
      <p className="text-xs text-gray-400 mb-4">
        This is a demo/mock billing flow — clicking a plan updates it instantly. In production this would go
        through a real payment provider (see the e-commerce task&apos;s Stripe checkout for that pattern).
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`border rounded-xl p-4 flex flex-col ${
                isCurrent ? "border-brand-500 ring-1 ring-brand-500" : "border-gray-200"
              }`}
            >
              <p className="font-semibold text-gray-900">{plan.label}</p>
              <p className="text-sm text-gray-500 mb-3">{plan.price}</p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4 flex-1">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleChangePlan(plan.id)}
                disabled={isCurrent || loading === plan.id}
                className={`text-sm py-1.5 rounded-lg font-medium transition ${
                  isCurrent
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                }`}
              >
                {isCurrent ? "Current plan" : loading === plan.id ? "Updating..." : "Choose plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
