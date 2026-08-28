<template>
  <AdminFeaturePage title="Backup & Restore" description="Manage backup inventory, restore previews, recovery settings, and platform restore history.">
    <div class="grid gap-4 xl:grid-cols-2">
      <BackupList />
      <BackupSettings />
      <RestorePreview />
      <RestorationHistory />
      <RestoreModal class="xl:col-span-2" />
    </div>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import BackupList from './components/BackupList.vue'
import BackupSettings from './components/BackupSettings.vue'
import RestorationHistory from './components/RestorationHistory.vue'
import RestoreModal from './components/RestoreModal.vue'
import RestorePreview from './components/RestorePreview.vue'
</script>
