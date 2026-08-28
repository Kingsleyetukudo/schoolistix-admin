<template>
  <article class="kpi-card" :class="`kpi-card--${surfaceMode}`" :style="themeStyle">
    <div class="kpi-card__accent"></div>

    <div class="kpi-card__header">
      <div class="min-w-0">
        <p class="kpi-card__eyebrow">{{ eyebrow || 'Platform metric' }}</p>
        <h3>{{ title }}</h3>
      </div>

      <span class="kpi-card__icon-shell">
        <component :is="icon" class="h-4.5 w-4.5" :stroke-width="2.2" />
      </span>
    </div>

    <div class="kpi-card__value-row">
      <div class="min-w-0">
        <p class="kpi-card__value">{{ value }}</p>
        <div class="kpi-card__trend-row">
          <span class="kpi-card__trend-chip">
            <component :is="trendIcon" class="h-3.5 w-3.5" :stroke-width="2.3" />
            {{ trend }}
          </span>
          <span class="kpi-card__trend-label">{{ trendLabel }}</span>
        </div>
      </div>

      <span v-if="supportingValue" class="kpi-card__supporting-value">
        {{ supportingValue }}
      </span>
    </div>

    <div class="kpi-card__sparkline">
      <svg viewBox="0 0 220 70" class="h-16 w-full overflow-visible">
        <defs>
          <linearGradient :id="gradientId" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" :stop-color="theme.accentSoft" />
            <stop offset="100%" :stop-color="theme.accent" />
          </linearGradient>
          <linearGradient :id="fillId" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" :stop-color="theme.fillStart" />
            <stop offset="100%" :stop-color="theme.fillEnd" />
          </linearGradient>
        </defs>

        <g :stroke="`var(--kpi-card-grid)`" stroke-width="1">
          <line v-for="line in [14, 34, 54]" :key="line" x1="0" :y1="line" x2="220" :y2="line" />
        </g>

        <path :d="sparklineAreaPath" :fill="`url(#${fillId})`"></path>
        <path
          :d="sparklinePath"
          :stroke="`url(#${gradientId})`"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>

        <circle
          v-if="lastPoint"
          :cx="lastPoint.x"
          :cy="lastPoint.y"
          r="4.25"
          :fill="theme.accent"
          :stroke="`var(--kpi-card-point-stroke)`"
          stroke-width="3"
        ></circle>
      </svg>
    </div>

    <div class="kpi-card__footer">
      <p>{{ description }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-vue-next'

type CardTheme = 'violet' | 'emerald' | 'sky' | 'amber' | 'rose'
type TrendDirection = 'up' | 'down' | 'flat'

const props = withDefaults(
  defineProps<{
    title: string
    value: string
    trend: string
    trendLabel: string
    description: string
    icon: Component
    theme?: CardTheme
    trendDirection?: TrendDirection
    surfaceMode?: 'light' | 'dark'
    eyebrow?: string
    supportingValue?: string
    sparkline?: number[]
  }>(),
  {
    theme: 'violet',
    trendDirection: 'up',
    surfaceMode: 'dark',
    eyebrow: '',
    supportingValue: '',
    sparkline: () => [],
  },
)

const themeMap: Record<
  CardTheme,
  {
    accent: string
    accentSoft: string
    fillStart: string
    fillEnd: string
    border: string
    wash: string
  }
> = {
  violet: {
    accent: '#8b5cf6',
    accentSoft: '#d8b4fe',
    fillStart: 'rgba(139,92,246,0.24)',
    fillEnd: 'rgba(139,92,246,0.02)',
    border: 'rgba(139,92,246,0.28)',
    wash: 'rgba(139,92,246,0.08)',
  },
  emerald: {
    accent: '#10b981',
    accentSoft: '#a7f3d0',
    fillStart: 'rgba(16,185,129,0.24)',
    fillEnd: 'rgba(16,185,129,0.02)',
    border: 'rgba(16,185,129,0.24)',
    wash: 'rgba(16,185,129,0.08)',
  },
  sky: {
    accent: '#0ea5e9',
    accentSoft: '#bae6fd',
    fillStart: 'rgba(14,165,233,0.24)',
    fillEnd: 'rgba(14,165,233,0.02)',
    border: 'rgba(14,165,233,0.24)',
    wash: 'rgba(14,165,233,0.08)',
  },
  amber: {
    accent: '#f59e0b',
    accentSoft: '#fde68a',
    fillStart: 'rgba(245,158,11,0.24)',
    fillEnd: 'rgba(245,158,11,0.02)',
    border: 'rgba(245,158,11,0.24)',
    wash: 'rgba(245,158,11,0.08)',
  },
  rose: {
    accent: '#f43f5e',
    accentSoft: '#fecdd3',
    fillStart: 'rgba(244,63,94,0.24)',
    fillEnd: 'rgba(244,63,94,0.02)',
    border: 'rgba(244,63,94,0.24)',
    wash: 'rgba(244,63,94,0.08)',
  },
}

const theme = computed(() => themeMap[props.theme])

const themeStyle = computed(
  () =>
    ({
      '--kpi-accent': theme.value.accent,
      '--kpi-accent-soft': theme.value.accentSoft,
      '--kpi-border': theme.value.border,
      '--kpi-wash': theme.value.wash,
      '--kpi-card-bg':
        props.surfaceMode === 'light'
          ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,248,251,0.98))'
          : 'linear-gradient(180deg, rgba(11,18,25,0.98), rgba(7,13,18,0.98))',
      '--kpi-card-border':
        props.surfaceMode === 'light'
          ? 'rgba(15, 23, 42, 0.08)'
          : 'rgba(109, 130, 150, 0.16)',
      '--kpi-card-shadow':
        props.surfaceMode === 'light'
          ? '0 18px 54px -38px rgba(15, 23, 42, 0.22)'
          : '0 18px 60px -38px rgba(0, 0, 0, 0.92)',
      '--kpi-card-title': props.surfaceMode === 'light' ? '#10202b' : '#f8fbff',
      '--kpi-card-value': props.surfaceMode === 'light' ? '#081824' : '#ffffff',
      '--kpi-card-muted': props.surfaceMode === 'light' ? '#5d7182' : '#90a1b1',
      '--kpi-card-soft': props.surfaceMode === 'light' ? '#6d8091' : '#728597',
      '--kpi-card-surface':
        props.surfaceMode === 'light'
          ? 'rgba(15, 23, 42, 0.03)'
          : 'rgba(255, 255, 255, 0.04)',
      '--kpi-card-spark':
        props.surfaceMode === 'light'
          ? 'rgba(255, 255, 255, 0.82)'
          : 'rgba(255, 255, 255, 0.02)',
      '--kpi-card-point-stroke': props.surfaceMode === 'light' ? '#ffffff' : '#071118',
      '--kpi-card-grid': props.surfaceMode === 'light' ? 'rgba(128,145,167,0.1)' : 'rgba(128,145,167,0.12)',
    }) satisfies Record<string, string>,
)

const gradientId = computed(() => `kpi-gradient-${props.title.toLowerCase().replace(/\s+/g, '-')}`)
const fillId = computed(() => `kpi-fill-${props.title.toLowerCase().replace(/\s+/g, '-')}`)

const trendIcon = computed<Component>(() => {
  if (props.trendDirection === 'down') return ArrowDownRight
  if (props.trendDirection === 'flat') return ArrowRight
  return ArrowUpRight
})

const sparklineValues = computed(() => {
  const values = props.sparkline.map((value) => Number(value)).filter((value) => Number.isFinite(value))
  return values.length >= 2 ? values : [10, 14, 13, 18, 20, 24]
})

const sparklinePoints = computed(() => {
  const values = sparklineValues.value
  const width = 220
  const height = 54
  const top = 8
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(max - min, 1)

  return values.map((value, index) => {
    const x = (width / Math.max(values.length - 1, 1)) * index
    const y = top + height - ((value - min) / range) * height
    return { x, y }
  })
})

const sparklinePath = computed(() => {
  return sparklinePoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
})

const sparklineAreaPath = computed(() => {
  const points = sparklinePoints.value
  if (!points.length) return ''

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const last = points[points.length - 1]
  const first = points[0]

  return `${linePath} L ${last.x} 66 L ${first.x} 66 Z`
})

const lastPoint = computed(() => sparklinePoints.value[sparklinePoints.value.length - 1] ?? null)
</script>

<style scoped>
.kpi-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--kpi-card-border);
  border-radius: 1.6rem;
  background: radial-gradient(circle at top right, var(--kpi-wash), transparent 34%), var(--kpi-card-bg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    var(--kpi-card-shadow);
  padding: 1.15rem;
}

.kpi-card__accent {
  position: absolute;
  inset: 0 auto auto 0;
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, var(--kpi-accent), transparent 72%);
}

.kpi-card__header,
.kpi-card__value-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.8rem;
}

.kpi-card__eyebrow {
  margin: 0;
  color: var(--kpi-card-soft);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.kpi-card h3 {
  margin: 0.55rem 0 0;
  color: var(--kpi-card-title);
  font-size: 0.95rem;
  font-weight: 700;
}

.kpi-card__icon-shell {
  display: inline-flex;
  height: 2.65rem;
  width: 2.65rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--kpi-border);
  border-radius: 0.95rem;
  background: var(--kpi-card-surface);
  color: var(--kpi-accent-soft);
}

.kpi-card__value-row {
  margin-top: 1rem;
}

.kpi-card__value {
  margin: 0;
  color: var(--kpi-card-value);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
}

.kpi-card__trend-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.7rem;
}

.kpi-card__trend-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--kpi-border);
  border-radius: 999px;
  background: var(--kpi-card-surface);
  color: var(--kpi-accent-soft);
  padding: 0.32rem 0.68rem;
  font-size: 0.76rem;
  font-weight: 700;
}

.kpi-card__trend-label {
  color: var(--kpi-card-muted);
  font-size: 0.76rem;
}

.kpi-card__supporting-value {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--kpi-card-border);
  border-radius: 999px;
  background: var(--kpi-card-surface);
  color: var(--kpi-card-title);
  padding: 0.42rem 0.72rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kpi-card__sparkline {
  position: relative;
  z-index: 1;
  margin-top: 1rem;
  overflow: hidden;
  border: 1px solid var(--kpi-card-border);
  border-radius: 1.1rem;
  background: var(--kpi-card-spark);
  padding: 0.7rem 0.8rem 0.45rem;
}

.kpi-card__footer {
  position: relative;
  z-index: 1;
  margin-top: 0.9rem;
  border-top: 1px solid var(--kpi-card-border);
  padding-top: 0.85rem;
}

.kpi-card__footer p {
  margin: 0;
  color: var(--kpi-card-muted);
  font-size: 0.8rem;
  line-height: 1.6;
}
</style>
