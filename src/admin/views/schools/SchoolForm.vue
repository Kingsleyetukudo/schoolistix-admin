<template>
  <AdminFeaturePage title="School Form" description="Create or update school tenant records, plans, and platform metadata.">
    <div class="admin-card grid gap-4 p-6 md:grid-cols-2">
      <AdminFormInput v-model="schoolName" label="School name" />
      <AdminFormInput v-model="subdomain" label="Subdomain" />
      <AdminFormSelect v-model="plan" label="Plan" :options="planOptions" />
      <AdminFormSelect v-model="status" label="Status" :options="statusOptions" />
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import AdminFormInput from '@admin/components/forms/AdminFormInput.vue'
import AdminFormSelect from '@admin/components/forms/AdminFormSelect.vue'

const schoolName = ref('')
const subdomain = ref('')
const plan = ref('starter')
const status = ref('active')

const planOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Growth', value: 'growth' },
  { label: 'Enterprise', value: 'enterprise' },
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Trial', value: 'trial' },
  { label: 'Suspended', value: 'suspended' },
]
</script>
