<template>
  <AdminFeaturePage title="Feature Flags" description="Enable or disable rollout gates, platform toggles, and tenant-level overrides.">
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <FeatureToggle />
      <FeatureOverrideModal />
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import FeatureOverrideModal from './components/FeatureOverrideModal.vue'
import FeatureToggle from './components/FeatureToggle.vue'
</script>
