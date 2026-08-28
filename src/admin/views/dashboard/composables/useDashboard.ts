import { computed, onMounted, ref } from "vue";
import {
  School,
  Users,
  UserCheck,
  DollarSign,
  BookOpen,
  CreditCard,
  HardDrive,
  MessageSquare,
  ShieldCheck,
} from "lucide-vue-next";
import { paymentsApi } from "@admin/services/paymentsApi";
import { useBackupsStore } from "@admin/stores/backups.store";
import { useHealthStore } from "@admin/stores/health.store";
import { useReportsStore } from "@admin/stores/reports.store";
import { useSchoolsStore } from "@admin/stores/schools.store";
import { useSubscriptionsStore } from "@admin/stores/subscriptions.store";
import { useSupportStore } from "@admin/stores/support.store";

type DashboardNotice = {
  tone: "info" | "warning";
  message: string;
};

type FishermanRow = {
  id: string;
  name: string;
  contact: string;
  email: string;
  location: string;
  fishLogged: number;
  role: string;
  status: "Active" | "Inactive";
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const profitLabels = ["Jan 1", "Jan 8", "Jan 15", "Jan 22", "Jan 29", "Feb 5"];

const taskLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const visitorBreakdown = [
  { label: "Organic", value: 30, color: "#d946ef" },
  { label: "Social", value: 50, color: "#2563eb" },
  { label: "Direct", value: 20, color: "#22d3ee" },
];

const customerTypeColors = ["#d946ef", "#2563eb", "#22d3ee"];

const customerTypeSeries = [
  {
    name: "Current clients",
    data: [28, 44, 58, 52, 30, 40, 20, 60, 35, 18, 32, 42],
  },
  {
    name: "Subscribers",
    data: [12, 18, 24, 16, 10, 22, 8, 14, 20, 18, 16, 22],
  },
  {
    name: "New customers",
    data: [10, 16, 20, 18, 12, 14, 8, 22, 14, 26, 18, 24],
  },
];

const products = [
  {
    name: "iPhone 14 Pro Max",
    note: "524 in stock",
    price: "$1,099.00",
  },
  {
    name: "Apple Watch S8",
    note: "320 in stock",
    price: "$799.00",
  },
];

const teamMembers = [
  {
    name: "John Carter",
    email: "contact@sophiemoore.com",
    initials: "JC",
    progress: 60,
  },
  {
    name: "Sophie Moore",
    email: "contact@sophiemoore.com",
    initials: "SM",
    progress: 33,
  },
  {
    name: "Matt Cannon",
    email: "info@mattcannon.com",
    initials: "MC",
    progress: 75,
  },
];

const fishermenRows: FishermanRow[] = [
  {
    id: "123456",
    name: "Tunde Bakare",
    contact: "0803 456 7890",
    email: "tundebakare@gmail.com",
    location: "Enu Ama",
    fishLogged: 14,
    role: "Boat Captain",
    status: "Active",
  },
  {
    id: "789012",
    name: "Ibrahim Lawal",
    contact: "0812 345 6789",
    email: "ibrahimlawal@gmail.com",
    location: "Okesiri",
    fishLogged: 20,
    role: "Boat Driver",
    status: "Active",
  },
  {
    id: "345678",
    name: "Yakubu Umar",
    contact: "0701 234 5678",
    email: "yakubuumar@gmail.com",
    location: "Enu Ama",
    fishLogged: 55,
    role: "Net Handler",
    status: "Active",
  },
  {
    id: "901234",
    name: "Daniel Ekene",
    contact: "0909 876 5432",
    email: "danielekene@gmail.com",
    location: "Okesiri",
    fishLogged: 11,
    role: "Member",
    status: "Active",
  },
  {
    id: "567890",
    name: "Saidu Bello",
    contact: "0814 321 0987",
    email: "saidubello@gmail.com",
    location: "Enu Ama",
    fishLogged: 45,
    role: "Boat Captain",
    status: "Inactive",
  },
  {
    id: "234567",
    name: "Kofi Mensah",
    contact: "0805 678 9012",
    email: "kofimensah@gmail.com",
    location: "Okesiri",
    fishLogged: 34,
    role: "Net Handler",
    status: "Inactive",
  },
  {
    id: "890123",
    name: "Chima Okafor",
    contact: "0816 543 2109",
    email: "chimaokafor@gmail.com",
    location: "Enu Ama",
    fishLogged: 58,
    role: "Member",
    status: "Active",
  },
  {
    id: "456789",
    name: "Isaac Opoku",
    contact: "0708 765 4321",
    email: "isaacopoku@gmail.com",
    location: "Okesiri",
    fishLogged: 65,
    role: "Boat Driver",
    status: "Inactive",
  },
  {
    id: "012345",
    name: "Bala Tunde",
    contact: "0817 654 3210",
    email: "balatunde@gmail.com",
    location: "Enu Ama",
    fishLogged: 10,
    role: "Boat Captain",
    status: "Active",
  },
  {
    id: "678901",
    name: "Kunle Adesoji",
    contact: "0902 345 6781",
    email: "kunleadesoji@gmail.com",
    location: "Okesiri",
    fishLogged: 35,
    role: "Boat Driver",
    status: "Active",
  },
];

export function useDashboard() {
  const schoolsStore = useSchoolsStore();
  const subscriptionsStore = useSubscriptionsStore();
  const supportStore = useSupportStore();
  const healthStore = useHealthStore();
  const reportsStore = useReportsStore();
  const backupsStore = useBackupsStore();

  const payments = ref<Array<Record<string, unknown>>>([]);
  const dashboardNotice = ref<DashboardNotice | null>(null);
  const isRefreshing = ref(false);
  const lastUpdatedAt = ref(new Date());

  const numberFormatter = new Intl.NumberFormat("en-US");
  const schoolStats = computed(() => schoolsStore.stats);
  const totalSchools = computed(
    () => schoolStats.value?.totalSchools ?? schoolsStore.schools.length,
  );
  const totalSchoolsText = computed(() =>
    numberFormatter.format(totalSchools.value),
  );
  const totalStudents = computed(() =>
    schoolsStore.schools.reduce(
      (sum, school) => sum + Number(school.students ?? 0),
      0,
    ),
  );
  const totalStudentsText = computed(() =>
    numberFormatter.format(totalStudents.value),
  );
  const totalTeachers = computed(() =>
    schoolsStore.schools.reduce(
      (sum, school) => sum + Number(school.staff ?? 0),
      0,
    ),
  );
  const activeSchools = computed(() => schoolStats.value?.activeSchools ?? 0);
  const trialSchools = computed(() => schoolStats.value?.trialSchools ?? 0);
  const suspendedSchools = computed(
    () => schoolStats.value?.suspendedSchools ?? 0,
  );
  const totalStorageUsedGb = computed(() =>
    schoolsStore.schools.reduce(
      (sum, school) => sum + Number(school.storageGb ?? 0),
      0,
    ),
  );
  const monthlyRecurringRevenue = computed(() =>
    subscriptionsStore.subscriptions.reduce(
      (sum, sub) => sum + Number(sub.amount ?? 0),
      0,
    ),
  );
  const activeSubscriptionsList = computed(() =>
    subscriptionsStore.subscriptions.filter((sub) => sub.status === "active"),
  );
  const openTickets = computed(() =>
    supportStore.tickets.filter((ticket) => ticket.status !== "resolved"),
  );
  const highPriorityTicket = computed(
    () =>
      supportStore.tickets.find(
        (ticket) => ticket.priority === "high" && ticket.status !== "resolved",
      ) ??
      supportStore.tickets[0] ??
      null,
  );
  const openTicketCount = computed(
    () =>
      supportStore.tickets.filter((ticket) => ticket.status !== "resolved")
        .length,
  );
  const failedPayments = computed(
    () =>
      payments.value.filter((payment) => payment.status === "failed").length,
  );
  const refundedPayments = computed(
    () =>
      payments.value.filter((payment) => payment.status === "refunded").length,
  );
  const revenueSeries = computed(() => {
    const charts = (reportsStore.overview?.charts ?? {}) as Record<string, unknown>
    const revenue = charts.revenue
    return Array.isArray(revenue) ? revenue.map((value: unknown) => Number(value)) : []
  });
  const expensesSeries = computed(() =>
    revenueSeries.value.map((value, index) =>
      Math.max(0, Math.round(value * (0.72 + (index % 3) * 0.03))),
    ),
  );
  const revenuePercentChange = computed(() =>
    formatPercentDelta(revenueSeries.value),
  );
  const generatedAtLabel = computed(() =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(lastUpdatedAt.value),
  );
  const revenueTrend = computed(
    () => `${revenuePercentChange.value} vs prior period`,
  );
  const revenueHeadline = computed(() => formatCompactCurrency(240800));
  const profitHeadline = computed(() => formatCompactCurrency(144600));
  const churnRate = computed(() =>
    totalSchools.value > 0
      ? `${((suspendedSchools.value / totalSchools.value) * 100).toFixed(1)}%`
      : "0.0%",
  );
  const averageRevenuePerSchool = computed(() =>
    totalSchools.value > 0
      ? monthlyRecurringRevenue.value / totalSchools.value
      : 0,
  );
  const schoolNetworkMix = computed(() => {
    const total = Math.max(totalSchools.value, 1);

    return [
      {
        label: "Active schools",
        valueText: `${activeSchools.value} live tenants`,
        percentage: Math.round((activeSchools.value / total) * 100),
        color: "#57c3ff",
      },
      {
        label: "Trial schools",
        valueText: `${trialSchools.value} in evaluation`,
        percentage: Math.round((trialSchools.value / total) * 100),
        color: "#fdb52a",
      },
      {
        label: "Suspended",
        valueText: `${suspendedSchools.value} paused tenants`,
        percentage: Math.round((suspendedSchools.value / total) * 100),
        color: "#ff5ea8",
      },
    ];
  });
  const infrastructureSignals = computed(() => {
    const apiStatus = String(healthStore.overview.api ?? "healthy");
    const databaseStatus = String(
      healthStore.overview.database ?? healthStore.overview.db ?? "healthy",
    );
    const queueStatus = String(healthStore.overview.queue ?? "healthy");
    const readyBackups = backupsStore.backups.filter(
      (backup) => backup.status === "ready",
    ).length;
    const failedBackups = backupsStore.backups.filter(
      (backup) => backup.status === "failed",
    ).length;

    return [
      {
        label: "API uptime",
        value: capitalize(apiStatus),
        valueClass: toneClassForStatus(apiStatus),
        detail: "Platform requests and routing",
      },
      {
        label: "Database",
        value: capitalize(databaseStatus),
        valueClass: toneClassForStatus(databaseStatus),
        detail: "Connection pool and query health",
      },
      {
        label: "Queue",
        value: capitalize(queueStatus),
        valueClass: toneClassForStatus(queueStatus),
        detail: "Background jobs and retries",
      },
      {
        label: "Backups",
        value: `${readyBackups}/${backupsStore.backups.length || 0} ready`,
        valueClass: failedBackups > 0 ? "warning" : "success",
        detail: `${failedBackups} failed snapshot(s)`,
      },
    ];
  });
  const priorityItems = computed(() => {
    const failedBackups = backupsStore.backups.filter(
      (backup) => backup.status === "failed",
    ).length;
    const openSchoolTicket = highPriorityTicket.value;

    return [
      {
        title: "Open support tickets",
        detail: `${openTicketCount.value} cases pending admin response`,
        meta: "Queue",
        metaClass: openTicketCount.value > 0 ? "warning" : "success",
        help: "Keep the support queue moving.",
      },
      {
        title: "High priority escalation",
        detail: openSchoolTicket
          ? `${openSchoolTicket.subject} • ${openSchoolTicket.schoolName}`
          : "No urgent escalations in the queue",
        meta: openSchoolTicket?.priority === "high" ? "High" : "Normal",
        metaClass: openSchoolTicket?.priority === "high" ? "danger" : "default",
        help: "Escalate immediately when needed.",
      },
      {
        title: "Backup health",
        detail: failedBackups
          ? `${failedBackups} backup job(s) failed`
          : "Latest scheduled backup is ready",
        meta: failedBackups > 0 ? "Review" : "Healthy",
        metaClass: failedBackups > 0 ? "warning" : "success",
        help: "Validate restore points before deployments.",
      },
    ];
  });
  const topSchools = computed(() => {
    const schools = [...schoolsStore.schools]
      .sort(
        (left, right) =>
          Number(right.students ?? 0) - Number(left.students ?? 0),
      )
      .slice(0, 4);
    const maxStudents = Math.max(
      ...schools.map((school) => Number(school.students ?? 0)),
      1,
    );

    return schools.map((school) => ({
      name: school.name,
      progress: `${Math.max(
        18,
        Math.round((Number(school.students ?? 0) / maxStudents) * 100),
      )}%`,
      studentText: numberFormatter.format(Number(school.students ?? 0)),
      staffText: `${numberFormatter.format(Number(school.staff ?? 0))} staff`,
    }));
  });
  const recentActivity = computed(() => {
    const latestTicket = supportStore.tickets[0];
    const latestBackup = backupsStore.backups[0];
    const latestSchool = schoolsStore.schools[0];

    return [
      {
        title: latestSchool
          ? `New school: ${latestSchool.name}`
          : "No new school activity",
        detail: latestSchool
          ? `${latestSchool.plan} plan • ${capitalize(latestSchool.status)}`
          : "School registrations will appear here.",
        meta: latestSchool
          ? formatRelativeTime(latestSchool.createdAt)
          : "Idle",
        tone: "success" as const,
      },
      {
        title: latestTicket
          ? `Support: ${latestTicket.subject}`
          : "No open support updates",
        detail: latestTicket
          ? `${latestTicket.schoolName} • ${capitalize(String(latestTicket.priority))} priority`
          : "Support conversations will show here.",
        meta: latestTicket
          ? formatRelativeTime(latestTicket.updatedAt)
          : "Idle",
        tone: latestTicket?.priority === "high" ? "warning" : "default",
      },
      {
        title: latestBackup
          ? `Backup: ${latestBackup.name}`
          : "No recent backups",
        detail: latestBackup
          ? `${numberFormatter.format(latestBackup.sizeMb)} MB • ${capitalize(latestBackup.status)}`
          : "Scheduled backups will show here.",
        meta: latestBackup
          ? formatRelativeTime(latestBackup.createdAt)
          : "Idle",
        tone: latestBackup?.status === "failed" ? "danger" : "success",
      },
    ];
  });
  const schoolsTableRows = computed(() =>
    [...schoolsStore.schools].map((school) => {
      const status = String(school.status ?? "active").toLowerCase();
      const statusText =
        status === "past_due" ? "Past due" : capitalize(status);
      const statusVariant =
        status === "active"
          ? "success"
          : status === "trial"
            ? "warning"
            : "danger";
      const subscriptionText =
        status === "active"
          ? "Covered"
          : status === "trial"
            ? "Trial"
            : "At risk";
      const subscriptionVariant =
        status === "active"
          ? "success"
          : status === "trial"
            ? "warning"
            : "danger";

      return {
        id: school.id,
        name: school.name,
        subdomain: school.subdomain,
        students: numberFormatter.format(Number(school.students ?? 0)),
        staff: numberFormatter.format(Number(school.staff ?? 0)),
        plan: capitalize(String(school.plan ?? "free")),
        tenantStatus: statusText,
        tenantStatusClass: statusVariant,
        subscriptionStatus: subscriptionText,
        subscriptionStatusClass: subscriptionVariant,
      };
    }),
  );

  const platformStatusLabel = computed(
    () =>
      `API ${capitalize(String(healthStore.overview.api ?? "healthy"))} / Queue ${capitalize(String(healthStore.overview.queue ?? "healthy"))}`,
  );

  const metricCards = computed(() => [
    {
      label: "Total Schools",
      value: totalSchools.value,
      icon: School,
      variant: "primary" as const,
      trendValue: "+12",
      trendDirection: "up" as const,
      trendPeriod: "this month",
      format: "number" as const,
    },
    {
      label: "Active Schools",
      value: activeSchools.value,
      icon: Users,
      variant: "blue" as const,
      trendValue: "+8.4%",
      trendDirection: "up" as const,
      trendPeriod: "vs last month",
      format: "number" as const,
    },
    {
      label: "Total Students",
      value: totalStudents.value,
      icon: UserCheck,
      variant: "cyan" as const,
      trendValue: "+6.2%",
      trendDirection: "up" as const,
      trendPeriod: "vs last term",
      format: "number" as const,
    },
    {
      label: "Total Teachers",
      value: totalTeachers.value,
      icon: BookOpen,
      variant: "purple" as const,
      trendValue: "+4.2%",
      trendDirection: "up" as const,
      trendPeriod: "vs last term",
      format: "number" as const,
    },
    {
      label: "Monthly Revenue",
      value: monthlyRecurringRevenue.value,
      icon: DollarSign,
      variant: "green" as const,
      trendValue: revenuePercentChange.value,
      trendDirection: "up" as const,
      trendPeriod: "vs last month",
      format: "currency" as const,
    },
    {
      label: "Storage Used",
      value: formatCompactStorage(totalStorageUsedGb.value),
      icon: HardDrive,
      variant: "orange" as const,
      trendValue: "+0.6 GB",
      trendDirection: "up" as const,
      trendPeriod: "vs last month",
      format: "text" as const,
    },
    {
      label: "Active Subscriptions",
      value: activeSubscriptionsList.value.length,
      icon: CreditCard,
      variant: "primary" as const,
      trendValue: "+15",
      trendDirection: "up" as const,
      trendPeriod: "this month",
      format: "number" as const,
    },
    {
      label: "Open Tickets",
      value: openTicketCount.value,
      icon: MessageSquare,
      variant: "blue" as const,
      trendValue: `${failedPayments.value} failed payments`,
      trendDirection: (failedPayments.value > 0 ? "down" : "flat") as
        | "down"
        | "flat",
      trendPeriod: "requires attention",
      format: "number" as const,
    },
    {
      label: "Platform Health",
      value: platformHealthScore.value,
      icon: ShieldCheck,
      variant: "green" as const,
      trendValue: "stable",
      trendDirection: "up" as const,
      trendPeriod: "all systems",
      format: "percentage" as const,
    },
  ]);

  const fishermenColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "id", label: "Fishermen ID", sortable: true },
    { key: "contact", label: "Contact", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "location", label: "Location", sortable: true },
    { key: "fishLogged", label: "Fish Logged", sortable: true },
    { key: "role", label: "Role", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      statusMap: {
        Active: "active",
        Inactive: "inactive",
      },
    },
  ];

  const fishermenFilters = [
    { key: "location", label: "Location", options: ["Enu Ama", "Okesiri"] },
    {
      key: "role",
      label: "Role",
      options: ["Boat Captain", "Boat Driver", "Net Handler", "Member"],
    },
    { key: "status", label: "Status", options: ["Active", "Inactive"] },
  ];

  const fishermenSearchFields = ["name", "id", "email", "location"];
  const profitSeries = computed(() => [18, 30, 24, 42, 56, 48]);
  const taskSeries = computed(() => [45, 52, 38, 65, 48, 72]);
  const transactionScore = computed(() => 80);
  const completedTasks = computed(() => numberFormatter.format(257));
  const supportSnapshot = computed(() => [
    { label: "Open tickets", value: openTickets.value.length },
    {
      label: "High priority",
      value:
        (highPriorityTicket.value?.subject as string | undefined) ?? "None",
    },
    { label: "Failed payments", value: failedPayments.value },
    { label: "Refunded", value: refundedPayments.value },
  ]);
  const platformHealthScore = computed(() => 92);

  async function refreshDashboard() {
    isRefreshing.value = true;
    dashboardNotice.value = null;

    try {
      const results = await Promise.allSettled([
        paymentsApi.list(),
        schoolsStore.fetchSchools({ page: 1, limit: 1000 }),
        subscriptionsStore.fetchSubscriptions(),
        supportStore.fetchTickets(),
        healthStore.fetchOverview(),
        reportsStore.fetchDashboard(),
        backupsStore.fetchBackups(),
      ]);

      const [paymentsResult] = results;
      payments.value =
        paymentsResult?.status === "fulfilled" &&
        Array.isArray(paymentsResult.value?.data)
          ? paymentsResult.value.data
          : [];

      const failedLoads = results.filter(
        (entry) => entry.status === "rejected",
      ).length;

      if (failedLoads > 0) {
        dashboardNotice.value = {
          tone: "warning",
          message: `Some dashboard modules could not be loaded (${failedLoads} of ${results.length}).`,
        };
      }

      lastUpdatedAt.value = new Date();
    } finally {
      isRefreshing.value = false;
    }
  }

  onMounted(() => {
    void refreshDashboard();
  });

  return {
    dashboardNotice,
    isRefreshing,
    platformStatusLabel,
    generatedAtLabel,
    totalSchoolsText,
    totalStudentsText,
    monthlyRecurringRevenue,
    revenuePercentChange,
    metricCards,
    monthLabels,
    visitorBreakdown,
    customerTypeSeries,
    customerTypeColors,
    revenueHeadline,
    revenueTrend,
    products,
    teamMembers,
    profitLabels,
    profitSeries,
    profitHeadline,
    taskLabels,
    taskSeries,
    transactionScore,
    completedTasks,
    fishermenColumns,
    fishermenFilters,
    fishermenSearchFields,
    fishermenRows,
    refreshDashboard,
    supportSnapshot,
    platformHealthScore,
    expensesSeries,
    averageRevenuePerSchool,
    churnRate,
    schoolNetworkMix,
    infrastructureSignals,
    priorityItems,
    topSchools,
    recentActivity,
    schoolsTableRows,
  };
}

function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPercentDelta(input: unknown) {
  const values = Array.isArray(input)
    ? input
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
    : [];

  if (values.length < 2) return "0.0%";

  const previous = values.at(-2) ?? 0;
  const current = values.at(-1) ?? 0;

  if (!previous) {
    return current ? "100.0%" : "0.0%";
  }

  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}

function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value)) return "$0";

  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(0)}`;
}

function formatCompactStorage(value: number) {
  if (!Number.isFinite(value)) return "0 GB";

  if (Math.abs(value) >= 1024) {
    return `${(value / 1024).toFixed(1)} TB`;
  }

  return `${value.toFixed(1)} GB`;
}

function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "just now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "just now";

  const deltaMinutes = Math.max(
    1,
    Math.round((Date.now() - timestamp) / 60000),
  );

  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays}d ago`;
}

function toneClassForStatus(value: string) {
  const normalized = value.toLowerCase();
  if (
    ["healthy", "ok", "online", "active", "ready", "success"].some((entry) =>
      normalized.includes(entry),
    )
  ) {
    return "success";
  }

  if (
    ["warn", "degraded", "pending", "partial", "trial"].some((entry) =>
      normalized.includes(entry),
    )
  ) {
    return "warning";
  }

  if (
    ["down", "failed", "error", "offline", "suspended"].some((entry) =>
      normalized.includes(entry),
    )
  ) {
    return "danger";
  }

  return "default";
}
