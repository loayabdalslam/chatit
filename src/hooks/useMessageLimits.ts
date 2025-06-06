import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface MessageLimits {
  free: number;
  pro: number;
  enterprise: number;
}

export const MESSAGE_LIMITS: MessageLimits = {
  free: 100,
  pro: 5000,
  enterprise: 50000
};

export function useMessageLimits() {
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);
  const messageCount = useQuery(api.analytics.getMonthlyMessageCount);

  const currentPlan = subscription?.plan || 'free';
  const limit = MESSAGE_LIMITS[currentPlan as keyof MessageLimits] || MESSAGE_LIMITS.free;
  const used = messageCount || 0;
  const remaining = Math.max(0, limit - used);
  const percentage = (used / limit) * 100;

  return {
    currentPlan,
    limit,
    used,
    remaining,
    percentage,
    isNearLimit: percentage >= 80,
    isOverLimit: used >= limit
  };
}
