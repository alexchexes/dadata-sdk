<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';
import type { PropType } from 'vue';
type TwMergeArgument = Parameters<typeof twMerge>[0];

defineProps({
  inputClass: {
    type: [Array, String, Boolean, null, undefined] as PropType<TwMergeArgument>,
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
  type: {
    type: String,
    default: 'text',
  },
});
const model = defineModel({ type: null });
</script>
<template>
  <label class="inline-block">
    <div v-if="label">{{ label }}</div>
    <input
      v-model="model"
      :class="twMerge('w-full rounded-lg border bg-white px-1.5 py-0.5', inputClass)"
      :placeholder
      :type
    />
  </label>
</template>
