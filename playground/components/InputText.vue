<script lang="ts" setup>
defineProps({
  inputClass: {
    type: null,
    default: undefined,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
});
const model = defineModel({ type: String });
</script>
<template>
  <label class="inline-block">
    <div v-if="label" class="pl-1 text-sm">{{ label }}</div>
    <input
      v-model="model"
      class="w-full rounded-lg border bg-white px-1.5 py-0.5"
      :placeholder
      type="text"
    />
  </label>
</template>
