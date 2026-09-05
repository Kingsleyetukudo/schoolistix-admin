<template>
  <AdminFeaturePage
    title="AI Knowledge Base"
    description="Oversee RAG document ingestion, chunk counts, storage usage, and embedding availability across schools."
  >
    <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="mt-2 text-sm text-slate-500">Loading knowledge base summary...</div>

    <template v-else-if="summary">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Documents (ready)</p>
          <p class="mt-2 text-3xl font-bold text-slate-800">{{ summary.readyDocuments }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ summary.totalDocuments }} total</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Indexed chunks</p>
          <p class="mt-2 text-3xl font-bold text-slate-800">{{ summary.totalChunks }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ summary.activeDocuments }} active documents</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Failed ingestion</p>
          <p class="mt-2 text-3xl font-bold text-slate-800">{{ summary.failedDocuments }}</p>
          <p class="mt-1 text-xs text-slate-400">Success rate: {{ summary.ingestionSuccessRate }}%</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Storage used</p>
          <p class="mt-2 text-3xl font-bold text-slate-800">{{ formatMB(summary.totalStorageBytes) }} MB</p>
          <p class="mt-1 text-xs text-slate-400">Cap: {{ formatMB(summary.storageLimitBytesPerSchool) }} MB per school</p>
        </div>
      </div>

      <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-700">Semantic retrieval (embeddings)</h3>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="summary.embeddings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ summary.embeddings.enabled ? 'Enabled' : 'Off' }}
          </span>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="summary.embeddings.columnAvailable ? 'bg-emerald-100 text-emerald-700' : summary.embeddings.columnAvailable === false ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'"
          >
            pgvector column: {{ summary.embeddings.columnAvailable === null ? 'unknown' : summary.embeddings.columnAvailable ? 'available' : 'missing' }}
          </span>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Model: {{ summary.embeddings.model || 'not configured' }}
          </span>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Dimensions: {{ summary.embeddings.dimensions }}
          </span>
        </div>
        <p class="mt-3 text-xs text-slate-400">
          When embeddings are off or the pgvector column is unavailable, school search automatically falls back to keyword retrieval with citations.
        </p>
      </section>

      <section class="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 class="text-sm font-semibold text-slate-700">Schools</h3>
          <span class="text-xs text-slate-400">{{ pagination.total }} with documents</span>
        </div>
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th class="px-5 py-3 font-medium">School</th>
              <th class="px-5 py-3 font-medium">Documents</th>
              <th class="px-5 py-3 font-medium">Chunks</th>
              <th class="px-5 py-3 font-medium">Storage</th>
              <th class="px-5 py-3 font-medium">Last upload</th>
              <th class="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in schools"
              :key="row.id"
              class="border-b border-slate-50 last:border-0"
            >
              <td class="px-5 py-3">
                <p class="font-medium text-slate-800">{{ row.name }}</p>
                <p class="text-xs text-slate-400">{{ row.billingPlan }} &middot; {{ row.subscriptionStatus }}</p>
              </td>
              <td class="px-5 py-3 text-slate-600">
                {{ row.activeDocuments }} active
                <span class="text-slate-400">({{ row.readyDocuments }} ready / {{ row.failedDocuments }} failed)</span>
              </td>
              <td class="px-5 py-3 text-slate-600">{{ row.chunkCount }}</td>
              <td class="px-5 py-3 text-slate-600">
                {{ formatMB(row.storageBytes) }} MB
                <span class="text-slate-400">/ {{ formatMB(row.storageLimitBytes) }} MB</span>
              </td>
              <td class="px-5 py-3 text-slate-600">{{ formatDate(row.lastUploadAt) }}</td>
              <td class="px-5 py-3">
                <span
                  v-if="row.atDocumentLimit"
                  class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                >
                  At document limit
                </span>
                <span
                  v-else
                  class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600"
                >
                  {{ row.documentLimit - row.totalDocuments }} slots left
                </span>
              </td>
            </tr>
            <tr v-if="!schools.length">
              <td class="px-5 py-6 text-center text-slate-400" colspan="6">No knowledge documents indexed yet.</td>
            </tr>
          </tbody>
        </table>
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p class="text-xs text-slate-400">Page {{ pagination.page }} of {{ pagination.totalPages }}</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="pagination.page <= 1"
              @click="goTo(pagination.page - 1)"
            >
              Prev
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="pagination.page >= pagination.totalPages"
              @click="goTo(pagination.page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </template>
  </AdminFeaturePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminFeaturePage from '@admin/components/common/AdminFeaturePage.vue'
import { aiApi, type AiKnowledgeSummaryResponse } from '@admin/services/aiApi'

const loading = ref(true)
const error = ref('')
const page = ref(1)
const data = ref<AiKnowledgeSummaryResponse | null>(null)

const summary = computed(() => data.value?.summary ?? null)
const schools = computed(() => data.value?.schools ?? [])
const pagination = computed(
  () =>
    data.value?.pagination ?? { page: 1, perPage: 25, total: 0, totalPages: 1 },
)

const formatMB = (bytes: number) => {
  const value = Math.max(0, Number(bytes) || 0) / (1024 * 1024)
  return value >= 10 ? Math.round(value).toLocaleString() : value.toFixed(1)
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '—'
  }
}

const load = async (targetPage = 1) => {
  loading.value = true
  error.value = ''
  try {
    data.value = await aiApi.knowledgeSummary({ page: targetPage, perPage: 25 })
    page.value = targetPage
  } catch (err) {
    error.value = 'Unable to load the knowledge base summary.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const goTo = async (targetPage: number) => {
  if (targetPage < 1) return
  await load(targetPage)
}

onMounted(() => load(1))
</script>
