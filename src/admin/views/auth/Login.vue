<template>
  <section class="flex min-h-screen items-center justify-center bg-white px-4 py-8">
    <div class="w-full max-w-[32rem]">
      <h1 class="text-center text-[2.15rem] font-extrabold uppercase tracking-[0.03em] text-slate-900 sm:text-[2.9rem]">
        {{ isSuperAdminLogin ? 'Super Admin Login' : 'Admin Login' }}
      </h1>
      <p class="mt-2 text-center text-sm text-slate-500">
        Sign in to the super admin control board.
      </p>

      <p
  v-if="isIdleLogout"
  class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
>
  You were logged out because the session was idle for over an hour. Please
  sign in again.
</p>

<form v-if="!pendingChallenge" class="mt-10 space-y-6" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="you@schoolistix.com"
            class="h-12 w-full rounded-xl border border-black bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Password
          </label>
          <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            class="h-12 w-full rounded-xl border border-black bg-white px-4 pr-12 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :title="showPassword ? 'Hide password' : 'Show password'"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="18" />
            <Eye v-else :size="18" />
          </button>
          </div>
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
      <form v-else class="mt-10 space-y-5" @submit.prevent="submitMfa">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <template v-if="pendingChallenge.mode === 'setup'">
            <p class="font-semibold text-slate-900">Set up authenticator verification</p>
            <p class="mt-1">Add Schoolistix Admin to an authenticator app, then enter its current six-digit code.</p>
            <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Setup key</p>
            <code class="mt-1 block break-all rounded-lg bg-white p-3 text-sm">{{ mfaSetup?.secret }}</code>
          </template>
          <template v-else>
            <p class="font-semibold text-slate-900">Two-step verification</p>
            <p class="mt-1">Enter the six-digit code from your authenticator app.</p>
          </template>
        </div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Authenticator code
          <input v-model="challengeCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required placeholder="000000" class="mt-1.5 h-12 w-full rounded-xl border border-black bg-white px-4 text-center text-lg tracking-[0.35em] text-slate-900 outline-none focus:ring-2 focus:ring-slate-300" />
        </label>
        <p v-if="error" class="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>
        <button type="submit" class="h-12 w-full rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-slate-700">
          {{ isLoading ? 'Verifying...' : pendingChallenge.mode === 'setup' ? 'Enable MFA and Sign In' : 'Verify and Sign In' }}
        </button>
        <button type="button" class="w-full text-sm font-semibold text-slate-500 hover:text-slate-900" @click="startOver">Back to sign in</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuth } from '@admin/composables/useAdminAuth'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { login, verifyMfa, clearChallenge, pendingChallenge, mfaSetup, isLoading, error } = useAdminAuth()

const isIdleLogout = computed(() => route.query.reason === 'idle')
const isSuperAdminLogin = computed(() => route.path.startsWith('/super-admin'))
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const challengeCode = ref('')

const finishSignIn = () => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/dashboard'
  router.push(redirect)
}

const submit = async () => {
  try {
    const result = await login({ email: email.value, password: password.value })
    if (!('mfaRequired' in result) && !('mfaSetupRequired' in result)) finishSignIn()
  } catch {}
}

const submitMfa = async () => {
  try {
    await verifyMfa(challengeCode.value)
    finishSignIn()
  } catch {}
}

const startOver = () => {
  clearChallenge()
  challengeCode.value = ''
}
</script>
