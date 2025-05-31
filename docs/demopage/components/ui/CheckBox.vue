<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';

type TwMergeArgument = Parameters<typeof twMerge>[0];

const props = defineProps<{
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  right?: boolean;
  class?: TwMergeArgument;
}>();

const model = defineModel({ type: Boolean });
</script>

<template>
  <label
    :class="
      twMerge(
        'flex items-center gap-1.5',
        props.class,
        disabled && 'text-slate-400',
        !disabled && 'hover:text-slate-950',
        !(checked || model) && 'text-slate-600',
      )
    "
  >
    <span v-if="right">{{ label }}</span>

    <input v-if="checked" class="accent-accent" :disabled checked type="checkbox" />
    <input v-else v-model="model" class="accent-accent" :disabled type="checkbox" />

    <span v-if="!right">{{ label }}</span>
  </label>
</template>
