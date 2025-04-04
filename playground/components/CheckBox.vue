<script lang="ts" setup>
defineProps<{
  label?: string;
  disabled?: boolean;
  checked?: boolean;
}>();
const model = defineModel({ type: Boolean });
</script>

<template>
  <label class="flex items-center gap-1.5" :class="disabled && 'text-slate-400'">
    <input v-if="checked" class="accent-accent" :disabled checked type="checkbox" />
    <input v-else v-model="model" class="accent-accent" :disabled type="checkbox" />
    {{ label }}
  </label>
</template>
