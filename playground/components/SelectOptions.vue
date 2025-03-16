<script lang="ts" setup>
defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  label: {
    type: String,
    default: '',
  },
});
const model = defineModel({ type: null });
</script>

<template>
  <label>
    <div v-if="label" class="pl-1 text-sm">{{ label }}</div>
    <select v-model="model" class="rounded-lg border bg-white">
      <option :value="undefined"></option>
      <option v-for="(option, key) in options" :key="key" :value="option">
        {{ option }}
      </option>
    </select>
  </label>
</template>
