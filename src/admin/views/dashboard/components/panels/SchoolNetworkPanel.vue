<template>
  <article class="ops-panel ops-panel--reach">
    <div class="ops-panel__header">
      <div>
        <span class="ops-panel__eyebrow">TENANT REACH</span>
        <h2>School Network Mix</h2>
      </div>
      <span class="ops-panel__pill ops-panel__pill--violet"
        >Live footprint</span
      >
    </div>
    <div class="reach-panel">
      <div class="reach-panel__gauge">
        <div class="reach-gauge">
          <div class="reach-gauge__inner">
            <strong>{{ activePercentage }}%</strong>
            <span>active footprint</span>
          </div>
        </div>
      </div>
      <div class="reach-panel__legend">
        <div
          v-for="item in platformMix"
          :key="item.label"
          class="reach-legend-item"
        >
          <div class="reach-legend-item__copy">
            <span
              class="reach-legend-item__swatch"
              :style="{ background: item.color }"
            ></span>
            <div>
              <strong>{{ item.label }}</strong>
              <p>{{ item.valueText }}</p>
            </div>
          </div>
          <span>{{ item.percentage }}%</span>
        </div>
        <div class="reach-legend-total">
          <span>Total</span>
          <strong>{{ totalSchools }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  platformMix: Array<{
    label: string;
    valueText: string;
    percentage: number;
    color: string;
  }>;
  totalSchools?: number;
}>();

const activePercentage = computed(() => {
  if (!props.platformMix || props.platformMix.length === 0) return 0;
  return props.platformMix[0]?.percentage || 0;
});

const totalSchools = computed(() => props.totalSchools || 0);
</script>

<style scoped>
.ops-panel {
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    180deg,
    rgba(16, 25, 53, 0.98),
    rgba(11, 15, 46, 0.98)
  );
  border-radius: 22px;
  padding: 1rem;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.ops-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.ops-panel__eyebrow {
  display: inline-block;
  margin-bottom: 0.35rem;
  color: #d1dbf9;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.ops-panel__header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
}

.ops-panel__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  background: rgba(108, 114, 255, 0.14);
  color: #d1dbf9;
}

.reach-panel {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  width: 100%;
}

.reach-panel__gauge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reach-gauge {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    from 0deg,
    #6c72ff 0deg 33deg,
    #57c3ff 33deg 66deg,
    #fdb52a 66deg 360deg
  );
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.reach-gauge__inner {
  width: 75%;
  height: 75%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: radial-gradient(
    circle at top,
    rgba(18, 28, 77, 0.95),
    rgba(11, 15, 46, 0.98)
  );
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.reach-gauge__inner strong {
  color: #ffffff;
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.2;
}

.reach-gauge__inner span {
  margin-top: 0.2rem;
  color: #aeb9e1;
  font-size: 0.55rem;
  font-weight: 600;
  text-align: center;
}

.reach-panel__legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.reach-legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.45rem 0.65rem;
}

.reach-legend-item__copy {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.reach-legend-item__swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.reach-legend-item__copy div {
  min-width: 0;
  flex: 1;
}

.reach-legend-item__copy strong {
  display: block;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reach-legend-item__copy p {
  margin: 0;
  color: #aeb9e1;
  font-size: 0.6rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reach-legend-item span:last-child {
  color: #d1dbf9;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.reach-legend-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.35rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.reach-legend-total span {
  color: #aeb9e1;
  font-size: 0.7rem;
  font-weight: 600;
}

.reach-legend-total strong {
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
}

/* Desktop Large */
@media (min-width: 1400px) {
  .reach-gauge {
    width: 180px;
    height: 180px;
  }

  .reach-gauge__inner strong {
    font-size: 1.5rem;
  }
}

/* Desktop Medium */
@media (max-width: 1200px) {
  .reach-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .reach-panel__gauge {
    margin: 0 auto;
  }

  .reach-gauge {
    width: 150px;
    height: 150px;
  }

  .reach-panel__legend {
    width: 100%;
  }
}

/* Tablet */
@media (max-width: 768px) {
  .ops-panel {
    padding: 0.85rem;
  }

  .reach-gauge {
    width: 130px;
    height: 130px;
  }

  .reach-gauge__inner strong {
    font-size: 1.1rem;
  }

  .reach-gauge__inner span {
    font-size: 0.5rem;
  }

  .reach-legend-item {
    padding: 0.4rem 0.6rem;
  }

  .reach-legend-item__copy strong {
    font-size: 0.7rem;
  }

  .reach-legend-item__copy p {
    font-size: 0.55rem;
  }

  .reach-legend-item span:last-child {
    font-size: 0.65rem;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .ops-panel {
    padding: 0.7rem;
  }

  .reach-gauge {
    width: 110px;
    height: 110px;
  }

  .reach-gauge__inner strong {
    font-size: 0.9rem;
  }

  .reach-gauge__inner span {
    font-size: 0.45rem;
  }

  .reach-legend-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .reach-legend-item__copy {
    width: 100%;
  }

  .reach-legend-item span:last-child {
    align-self: flex-end;
  }

  .reach-legend-total {
    margin-top: 0.3rem;
    padding-top: 0.3rem;
  }
}
</style>
