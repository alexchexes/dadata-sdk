<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';

type TwMergeArgument = Parameters<typeof twMerge>[0];

const props = defineProps<{
  class?: TwMergeArgument;
  label?: string | number | null;
  type: 'radio' | 'checkbox';
  value: any;
}>();

const model = defineModel({ type: null });
</script>

<template>
  <label
    :class="
      twMerge(
        `has-[input:checked]:bg-accent rounded-lg bg-[#e1e6ef] px-2 py-1 text-sm leading-none not-has-[input:checked]:cursor-pointer not-has-[input:checked]:hover:bg-slate-300 has-[input:checked]:text-(--vp-c-gutter) dark:bg-[#31333e] dark:not-has-[input:checked]:hover:bg-(--vp-c-bg-alt)`,
        props.class,
      )
    "
  >
    <input v-model="model" class="hidden" :type="type" :value />

    {{ label || value }}
  </label>
</template>
