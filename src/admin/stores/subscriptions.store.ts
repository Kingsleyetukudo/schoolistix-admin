import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { subscriptionsApi, type AdminSubscription } from "@admin/services/subscriptionsApi";

export const useSubscriptionsStore = defineStore("adminSubscriptions", () => {
  const subscriptions = ref<AdminSubscription[]>([]);
  const selectedSubscription = ref<AdminSubscription | null>(null);
  const isLoading = ref(false);
  const total = ref(0);

  const monthlyRecurringRevenue = computed(() => {
    if (!subscriptions.value.length) return 0;
    return subscriptions.value
      .filter((sub) => sub.status === "active" || sub.status === "trial")
      .reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0);
  });

  const activeSubscriptions = computed(() =>
    subscriptions.value.filter((sub) => sub.status === "active"),
  );

  const trialSubscriptions = computed(() =>
    subscriptions.value.filter((sub) => sub.status === "trial"),
  );

  const pastDueSubscriptions = computed(() =>
    subscriptions.value.filter((sub) => sub.status === "past_due"),
  );

  const cancelledSubscriptions = computed(() =>
    subscriptions.value.filter((sub) => sub.status === "cancelled"),
  );

  const expiredSubscriptions = computed(() =>
    subscriptions.value.filter((sub) => sub.status === "expired"),
  );

  const totalSubscriptionsCount = computed(() => subscriptions.value.length);
  const activeSubscriptionsCount = computed(() => activeSubscriptions.value.length);

  const subscriptionByPlan = computed(() => {
    const plans: Record<string, number> = {};
    subscriptions.value.forEach((sub) => {
      const plan = sub.plan || "unknown";
      plans[plan] = (plans[plan] || 0) + 1;
    });
    return plans;
  });

  const revenueByPlan = computed(() => {
    const revenue: Record<string, number> = {};
    subscriptions.value.forEach((sub) => {
      const plan = sub.plan || "unknown";
      revenue[plan] = (revenue[plan] || 0) + (Number(sub.amount) || 0);
    });
    return revenue;
  });

  const fetchSubscriptions = async (filters: {
    page?: number;
    limit?: number;
    status?: string;
    plan?: string;
    search?: string;
  } = {}) => {
    isLoading.value = true;
    try {
      const response = await subscriptionsApi.list(filters);
      subscriptions.value = response.data;
      total.value = response.pagination.total;
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSubscription = async (schoolId: string) => {
    selectedSubscription.value = await subscriptionsApi.get(schoolId);
  };

  const cancelSubscription = async (schoolId: string) => {
    const result = await subscriptionsApi.cancel(schoolId);
    await fetchSubscriptions();
    return result;
  };

  return {
    subscriptions,
    selectedSubscription,
    isLoading,
    total,
    monthlyRecurringRevenue,
    activeSubscriptions,
    trialSubscriptions,
    pastDueSubscriptions,
    cancelledSubscriptions,
    expiredSubscriptions,
    totalSubscriptionsCount,
    activeSubscriptionsCount,
    subscriptionByPlan,
    revenueByPlan,
    fetchSubscriptions,
    fetchSubscription,
    cancelSubscription,
  };
});