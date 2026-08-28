<template>
  <div class="holder-card">
    <slot />
  </div>
</template>

<script setup lang="ts">
// This component acts as a styled container for any content
// Use it like: <HolderCard><AnyComponent /></HolderCard>
</script>

<style lang="scss" scoped>
.holder-card {
  border-radius: 1.75rem;
  border: 1px solid rgba(108, 114, 255, 0.18);
  background: linear-gradient(
    180deg,
    rgba(15, 23, 53, 0.95),
    rgba(23, 33, 63, 0.92)
  );
  padding: 1rem;
  width: 100%;
  height: 100%;
  box-shadow: 0 22px 45px rgba(0, 0, 0, 0.18);
}
</style>
