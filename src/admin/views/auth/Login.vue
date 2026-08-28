<template>
  <section class="flex min-h-screen items-center justify-center bg-white px-4 py-8">
    <div class="w-full max-w-[32rem]">
      <h1 class="text-center text-[2.15rem] font-extrabold uppercase tracking-[0.03em] text-slate-900 sm:text-[2.9rem]">
        Admin Login
      </h1>
      <p class="mt-2 text-center text-sm text-slate-500">
        Sign in to the super admin control board.
      </p>

      <form class="mt-10 space-y-6" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            list="admin-emails"
            placeholder="you@schoolistix.com"
            class="h-12 w-full rounded-xl border border-black bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <datalist id="admin-emails">
            <option v-for="account in demoAccounts" :key="account" :value="account" />
          </datalist>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="h-12 w-full rounded-xl border border-black bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <p v-if="error" class="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ error }}
        </p>

        <button
          type="submit"
          class="h-12 w-full rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-slate-700"
        >
          {{ isLoading ? 'Signing In...' : 'Login' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuth } from '@admin/composables/useAdminAuth'

const demoAccounts = [
  'jane@schoolistix.com',
  'biola@schoolistix.com',
  'john@schoolistix.com',
  'sam@schoolistix.com',
  'amina@schoolistix.com',
]

const router = useRouter()
const route = useRoute()
const { login, isLoading, error } = useAdminAuth()

const email = ref(demoAccounts[0])
const password = ref('preview-password')

const submit = async () => {
  try {
    await login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/dashboard'
    router.push(redirect)
  } catch {}
}
</script>