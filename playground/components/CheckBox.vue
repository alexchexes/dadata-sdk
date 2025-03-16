<script lang="ts" setup>
defineProps({ label: { type: String, default: '' } });
const model = defineModel({ type: Boolean });
</script>

<template>
  <label class="flex items-center gap-1.5">
    <input v-model="model" class="accent-accent" type="checkbox" />
    {{ label }}
  </label>
</template>
