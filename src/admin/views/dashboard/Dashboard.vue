<template>
  <section class="dashboard-page">
    <DashboardHeader
      :platform-status-label="platformStatusLabel"
      :generated-at-label="generatedAtLabel"
      :is-refreshing="isRefreshing"
      @refresh="loadAll"
    />

    <div
      v-if="notice"
      class="dashboard-notice"
      :class="{ 'dashboard-notice--error': noticeTone === 'error' }"
    >
      {{ notice }}
    </div>

    <!-- KPI cards -->
    <div class="kpi-grid">
      <article v-for="card in metricCards" :key="card.label" class="kpi-card">
        <div class="kpi-card__copy">
          <p class="kpi-card__label">{{ card.label }}</p>
          <p class="kpi-card__value">{{ card.value }}</p>
        </div>
        <component :is="card.icon" class="kpi-card__icon" :stroke-width="2" />
      </article>
    </div>

    <!-- Charts -->
    <div class="dashboard-grid dashboard-grid--charts">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Growth</p>
            <h2>Schools registered (last {{ charts.range_days }} days)</h2>
          </div>
        </div>
        <AreaChart
          :data="schoolsAddedSeries"
          :categories="schoolsAddedLabels"
          label="Schools"
          color="#111111"
        />
      </div>

      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Adoption</p>
            <h2>Plan distribution</h2>
          </div>
        </div>
        <DonutChart
          :data="planDistributionData"
          center-label="Schools"
          :center-value="stats.total_schools"
        />
      </div>
    </div>

    <!-- Recent schools + pending payments -->
    <div class="dashboard-grid dashboard-grid--split">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Registrations</p>
            <h2>Recently registered schools</h2>
          </div>
          <RouterLink class="panel__link" :to="ADMIN_ROUTE_PATHS.schools">View all</RouterLink>
        </div>

        <div v-if="recentSchools.length" class="table-wrap">
          <table class="simple-table">
            <thead>
              <tr>
                <th>School</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="school in recentSchools" :key="String(school.id)">
                <td>
                  <strong>{{ school.name }}</strong>
                  <span class="table-sub">{{ school.subdomain }}</span>
                </td>
                <td>{{ String(school.plan ?? 'free').toUpperCase() }}</td>
                <td><AdminStatusBadge :status="String(school.status)" /></td>
                <td>{{ formatDate(school.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="panel-empty">No schools registered yet.</p>
      </div>

      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Payments</p>
            <h2>Manual payment approvals</h2>
          </div>
          <RouterLink class="panel__link" :to="ADMIN_ROUTE_PATHS.payments">All payments</RouterLink>
        </div>

        <div v-if="pendingPayments.length" class="table-wrap">
          <table class="simple-table">
            <thead>
              <tr>
                <th>School</th>
                <th>Amount</th>
                <th>Plan</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in pendingPayments" :key="String(payment.id)">
                <td>
                  <strong>{{ String(payment.school_name ?? '—') }}</strong>
                  <span class="table-sub">{{ String(payment.reference ?? '') }}</span>
                </td>
                <td>{{ formatAmount(payment) }}</td>
                <td>{{ String(payment.subscription_plan ?? payment.plan ?? '—').toUpperCase() }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn-approve" type="button" :disabled="approvingId === String(payment.id)" @click="openApprove(payment)">
                      Approve
                    </button>
                    <button class="btn-reject" type="button" @click="openReject(payment)">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="panel-empty">No pending manual payments.</p>
      </div>
    </div>

    <!-- Feature controls + admin users -->
    <div class="dashboard-grid dashboard-grid--split">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Features</p>
            <h2>Application feature controls</h2>
          </div>
          <RouterLink class="panel__link" :to="ADMIN_ROUTE_PATHS.features">Manage all</RouterLink>
        </div>

        <div v-if="features.length" class="feature-list">
          <label v-for="feature in features" :key="feature.key" class="feature-row">
            <span class="feature-row__copy">
              <strong>{{ feature.label }}</strong>
              <span>{{ feature.description }}</span>
            </span>
            <button
              type="button"
              role="switch"
              :aria-checked="feature.enabled"
              class="switch"
              :class="{ 'switch--on': feature.enabled }"
              :disabled="savingFeatureKey === feature.key"
              @click="toggle(feature)"
            >
              <span class="switch__thumb" />
            </button>
          </label>
        </div>
        <p v-else class="panel-empty">No feature flags loaded.</p>
      </div>

      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="panel__eyebrow">Operators</p>
            <h2>Admin user access</h2>
          </div>
          <RouterLink class="panel__link" :to="ADMIN_ROUTE_PATHS.users">Manage users</RouterLink>
        </div>

        <div v-if="adminUsers.length" class="user-list">
          <div v-for="user in visibleUsers" :key="String(user.id)" class="user-row">
            <div class="user-row__avatar">{{ initials(user) }}</div>
            <div class="user-row__copy">
              <strong>{{ String(user.name ?? '—') }}</strong>
              <span>{{ String(user.email ?? '') }}</span>
            </div>
            <AdminRoleBadge :role="String(user.role)" />
          </div>
        </div>
        <p v-else class="panel-empty">No admin users loaded.</p>

        <form class="invite-form" @submit.prevent="submitInvite">
          <input v-model="inviteName" class="invite-form__input" placeholder="Full name" required />
          <input v-model="inviteEmail" type="email" class="invite-form__input" placeholder="Work email" required />
          <SearchableDropdownSelect
            label="Role"
            :model-value="inviteRole"
            :options="roleOptions"
            @change="inviteRole = $event"
          />
          <button type="submit" class="invite-form__button" :disabled="isInviting">
            {{ isInviting ? 'Sending…' : 'Invite admin' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="panel">
      <div class="panel__header">
        <div>
          <p class="panel__eyebrow">Shortcuts</p>
          <h2>Site owner quick controls</h2>
        </div>
      </div>
      <div class="quick-actions">
        <RouterLink class="quick-action" :to="ADMIN_ROUTE_PATHS.payments">Approve pending payments</RouterLink>
        <RouterLink class="quick-action" :to="ADMIN_ROUTE_PATHS.features">Toggle feature flags</RouterLink>
        <RouterLink class="quick-action" :to="ADMIN_ROUTE_PATHS.users">Invite or remove admins</RouterLink>
        <RouterLink class="quick-action" :to="ADMIN_ROUTE_PATHS.schools">Manage schools</RouterLink>
        <RouterLink class="quick-action" :to="ADMIN_ROUTE_PATHS.subscriptions">Subscription health</RouterLink>
        <RouterLink class="quick-action" :to="ADMIN_ROUTE_PATHS.support">Support tickets</RouterLink>
      </div>
    </div>

    <AdminConfirmModal
      :open="approveOpen"
      title="Approve manual payment?"
      :description="approveDescription"
      @cancel="approveOpen = false"
      @confirm="confirmApprove"
    />

    <div v-if="rejectOpen" class="modal-overlay">
      <div class="modal-card">
        <h3>Reject manual payment?</h3>
        <p>This marks the payment as failed and the school will not receive access.</p>
        <textarea v-model="rejectReason" rows="3" class="modal-card__textarea" placeholder="Optional reason (stored on the payment record)" />
        <div class="modal-card__actions">
          <button type="button" class="modal-card__cancel" @click="rejectOpen = false">Cancel</button>
          <button type="button" class="modal-card__confirm" :disabled="isRejecting" @click="confirmReject">
            {{ isRejecting ? 'Rejecting…' : 'Reject Payment' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  HardDrive,
  School,
  UserCheck,
  Users,
} from 'lucide-vue-next'
import type { FeatureFlagItem } from '@admin/services/featuresApi'
import AdminStatusBadge from '@admin/components/common/AdminStatusBadge.vue'
import AdminConfirmModal from '@admin/components/common/AdminConfirmModal.vue'
import AdminRoleBadge from '@admin/views/users/components/AdminRoleBadge.vue'
import SearchableDropdownSelect from '@admin/components/common/SearchableDropdownSelect.vue'
import { ADMIN_ROUTE_PATHS } from '@admin/router/routes'
import { formatDate, formatNumber } from '@admin/utils/formatters'
import DashboardHeader from './components/DashboardHeader.vue'
import AreaChart from '@admin/components/charts/AreaChart.vue'
import DonutChart from '@admin/components/charts/DonutChart.vue'
import {
  useSuperAdminDashboard,
  type DashboardPaymentRow,
  type DashboardUserRow,
} from './composables/useSuperAdminDashboard'

const {
  stats,
  charts,
  recentSchools,
  pendingPayments,
  features,
  adminUsers,
  isRefreshing,
  notice,
  noticeTone,
  loadAll,
  approvePayment,
  rejectPayment,
  toggleFeature,
  inviteAdmin,
} = useSuperAdminDashboard()

const approveOpen = ref(false)
const rejectOpen = ref(false)
const rejectReason = ref('')
const pendingPayment = ref<DashboardPaymentRow | null>(null)
const approvingId = ref('')
const isRejecting = ref(false)
const savingFeatureKey = ref('')
const inviteName = ref('')
const inviteEmail = ref('')
const inviteRole = ref('support_admin')

const roleOptions = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Billing Admin', value: 'billing_admin' },
  { label: 'Support Admin', value: 'support_admin' },
  { label: 'Technical Admin', value: 'technical_admin' },
  { label: 'Auditor', value: 'auditor' },
]
const isInviting = ref(false)

const planColors: Record<string, string> = {
  free: '#9ca3af',
  basic: '#3b82f6',
  starter: '#f59e0b',
  growth: '#10b981',
  pro: '#8b5cf6',
  professional: '#8b5cf6',
  enterprise: '#0ea5e9',
}

const platformStatusLabel = computed(() => {
  const suspended = Number(stats.value.suspended_schools ?? 0)
  return suspended > 0 ? `${suspended} suspended school${suspended === 1 ? '' : 's'}` : 'Platform operational'
})

const generatedAtLabel = computed(() =>
  new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium' }).format(new Date()),
)

const metricCards = computed(() => [
  { label: 'Total Schools', value: formatNumber(Number(stats.value.total_schools ?? 0)), icon: School },
  { label: 'Active Schools', value: formatNumber(Number(stats.value.active_schools ?? 0)), icon: CheckCircle2 },
  { label: 'Trial Schools', value: formatNumber(Number(stats.value.trial_schools ?? 0)), icon: Clock },
  { label: 'Suspended', value: formatNumber(Number(stats.value.suspended_schools ?? 0)), icon: AlertTriangle },
  { label: 'Students', value: formatNumber(Number(stats.value.total_students ?? 0)), icon: Users },
  { label: 'Teachers', value: formatNumber(Number(stats.value.total_teachers ?? 0)), icon: UserCheck },
  { label: 'Storage', value: String(stats.value.storage_readable ?? '0 B'), icon: HardDrive },
  { label: 'Pending Payments', value: formatNumber(pendingPayments.value.length), icon: CreditCard },
])

const schoolsAddedLabels = computed(() => charts.value.schools_added.map((bucket) => bucket.label))
const schoolsAddedSeries = computed(() => charts.value.schools_added.map((bucket) => Number(bucket.count ?? 0)))
const planDistributionData = computed(() =>
  charts.value.plan_distribution.map((entry) => ({
    label: String(entry.plan ?? 'free').toUpperCase(),
    value: Number(entry.count ?? 0),
    color: planColors[String(entry.plan ?? 'free').toLowerCase()] ?? '#6b7280',
  })),
)

const visibleUsers = computed(() => adminUsers.value.slice(0, 5))

const approveDescription = computed(() => {
  const payment = pendingPayment.value
  if (!payment) return ''
  const amount = formatNumber(Number(payment.amount) || 0)
  const plan = String(payment.subscription_plan ?? payment.plan ?? 'current').toUpperCase()
  return `Confirm the ₦${amount} manual payment from ${String(payment.school_name ?? 'this school')}. This activates the school's ${plan} plan access.`
})

const formatAmount = (payment: DashboardPaymentRow) => `₦${formatNumber(Number(payment.amount) || 0)}`

const initials = (user: DashboardUserRow) => {
  const name = String(user.name ?? '')
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) ?? '?'
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return `${first}${last}`.toUpperCase()
}

const openApprove = (payment: DashboardPaymentRow) => {
  pendingPayment.value = payment
  approveOpen.value = true
}

const confirmApprove = async () => {
  const payment = pendingPayment.value
  if (!payment) return
  approveOpen.value = false
  approvingId.value = String(payment.id)
  const ok = await approvePayment(payment)
  approvingId.value = ''
  if (ok) pendingPayment.value = null
}

const openReject = (payment: DashboardPaymentRow) => {
  pendingPayment.value = payment
  rejectReason.value = ''
  rejectOpen.value = true
}

const confirmReject = async () => {
  const payment = pendingPayment.value
  if (!payment) return
  isRejecting.value = true
  const ok = await rejectPayment(payment, rejectReason.value)
  isRejecting.value = false
  if (ok) {
    rejectOpen.value = false
    pendingPayment.value = null
  }
}

const toggle = async (feature: FeatureFlagItem) => {
  if (savingFeatureKey.value) return
  savingFeatureKey.value = feature.key
  await toggleFeature(feature)
  savingFeatureKey.value = ''
}

const submitInvite = async () => {
  if (isInviting.value) return
  const parts = inviteName.value.trim().split(/\s+/)
  isInviting.value = true
  const ok = await inviteAdmin({
    firstName: parts[0] || 'Invited',
    lastName: parts.slice(1).join(' ') || 'Admin',
    email: inviteEmail.value.trim(),
    role: inviteRole.value,
  })
  isInviting.value = false
  if (ok) {
    inviteName.value = ''
    inviteEmail.value = ''
    inviteRole.value = 'support_admin'
  }
}
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 1rem;
  background: #ffffff;
  color: #111111;
}

.dashboard-notice {
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #111111;
  font-size: 0.88rem;
}

.dashboard-notice--error {
  color: #be123c;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.kpi-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.1rem 1.15rem;
  border: 1px solid #000000;
  border-radius: 0.9rem;
  background: #ffffff;
}

.kpi-card__label {
  color: #555555;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.kpi-card__value {
  margin-top: 0.3rem;
  color: #111111;
  font-size: 1.5rem;
  font-weight: 800;
}

.kpi-card__icon {
  width: 1.4rem;
  height: 1.4rem;
  color: #333333;
  flex-shrink: 0;
}

.dashboard-grid {
  display: grid;
  gap: 0.85rem;
}

.dashboard-grid--charts {
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
}

.dashboard-grid--split {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.panel {
  border: 1px solid #000000;
  border-radius: 0.9rem;
  background: #ffffff;
  padding: 1.1rem;
  min-width: 0;
}

.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.panel__eyebrow {
  color: #777777;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.panel__header h2 {
  margin: 0.2rem 0 0;
  color: #111111;
  font-size: 1rem;
  font-weight: 800;
}

.panel__link {
  color: #0369a1;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.panel-empty {
  padding: 1.5rem 0;
  color: #777777;
  font-size: 0.85rem;
}

.table-wrap {
  overflow-x: auto;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.simple-table th,
.simple-table td {
  padding: 0.7rem 0.6rem;
  border-bottom: 1px solid #000000;
  text-align: left;
  vertical-align: middle;
}

.simple-table th {
  color: #333333;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: #fafafa;
}

.simple-table tbody tr:last-child td {
  border-bottom: 0;
}

.simple-table strong {
  display: block;
  color: #111111;
  font-weight: 700;
}

.table-sub {
  display: block;
  color: #777777;
  font-size: 0.72rem;
  margin-top: 0.15rem;
}

.text-right {
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
}

.btn-approve,
.btn-reject {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 0.75rem;
  border: 1px solid #000000;
  border-radius: 999px;
  background: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-approve {
  color: #166534;
}

.btn-approve:hover {
  background: #f0fdf4;
}

.btn-approve:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reject {
  color: #be123c;
}

.btn-reject:hover {
  background: #fff1f2;
}

.feature-list {
  display: grid;
  gap: 0.55rem;
}

.feature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid #000000;
  border-radius: 0.75rem;
  background: #ffffff;
}

.feature-row__copy {
  min-width: 0;
}

.feature-row__copy strong {
  display: block;
  color: #111111;
  font-size: 0.82rem;
  font-weight: 700;
}

.feature-row__copy span {
  display: block;
  color: #777777;
  font-size: 0.72rem;
  margin-top: 0.15rem;
}

.switch {
  position: relative;
  width: 2.6rem;
  height: 1.4rem;
  border-radius: 999px;
  background: #d1d5db;
  border: 1px solid #000000;
  flex-shrink: 0;
  cursor: pointer;
}

.switch--on {
  background: #111111;
}

.switch__thumb {
  position: absolute;
  top: 0.15rem;
  left: 0.15rem;
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: #ffffff;
  transition: transform 160ms ease;
}

.switch--on .switch__thumb {
  transform: translateX(1.2rem);
}

.user-list {
  display: grid;
  gap: 0.55rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.user-row__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  border: 1px solid #000000;
  background: #f5f5f5;
  color: #111111;
  font-size: 0.68rem;
  font-weight: 800;
  flex-shrink: 0;
}

.user-row__copy {
  flex: 1;
  min-width: 0;
}

.user-row__copy strong {
  display: block;
  color: #111111;
  font-size: 0.8rem;
  font-weight: 700;
}

.user-row__copy span {
  display: block;
  color: #777777;
  font-size: 0.7rem;
}

.invite-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #000000;
}

.invite-form__input {
  min-width: 0;
  height: 2.5rem;
  border: 1px solid #000000;
  border-radius: 0.7rem;
  background: #ffffff;
  color: #111111;
  padding: 0 0.8rem;
  font-size: 0.8rem;
  outline: none;
}

.invite-form__button {
  grid-column: 1 / -1;
  height: 2.6rem;
  border: 1px solid #000000;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
}

.invite-form__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.quick-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 0.9rem;
  border: 1px solid #000000;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #111111;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.quick-action:hover {
  background: #f5f5f5;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 28rem;
  border-radius: 1rem;
  border: 1px solid #000000;
  background: #ffffff;
  padding: 1.5rem;
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.4);
}

.modal-card h3 {
  color: #111111;
  font-size: 1.05rem;
  font-weight: 700;
}

.modal-card p {
  color: #555555;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.modal-card__textarea {
  width: 100%;
  margin-top: 1rem;
  border: 1px solid #000000;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  outline: none;
  color: #111111;
}

.modal-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.modal-card__cancel {
  border: 1px solid #000000;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: #111111;
  background: #ffffff;
  cursor: pointer;
}

.modal-card__confirm {
  border: 1px solid #000000;
  border-radius: 999px;
  background: #be123c;
  color: #ffffff;
  font-weight: 700;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.modal-card__confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid--charts,
  .dashboard-grid--split {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions,
  .invite-form {
    grid-template-columns: 1fr;
  }

  .invite-form__button {
    grid-column: auto;
  }
}
</style>