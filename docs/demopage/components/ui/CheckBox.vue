<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';

import HelpHint from './HelpHint.vue';

type TwMergeArgument = Parameters<typeof twMerge>[0];

const props = defineProps<{
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  right?: boolean;
  class?: TwMergeArgument;
  helpLink?: string;
  helpTooltip?: boolean;
}>();

const model = defineModel({ type: Boolean });
</script>

<template>
  <label
    :class="
      twMerge(
        'flex items-center gap-1.5',
        props.class,
        disabled && 'text-(--vp-c-text-3)',
        !disabled && 'hover:text-slate-950 dark:hover:text-white',
        !(checked || model) && 'text-(--vp-c-text-2)',
      )
    "
  >
    <span v-if="right" class="flex items-center gap-1">
      {{ label }} <HelpHint v-if="helpLink" :helpLink :tooltip="props.helpTooltip" />
    </span>

    <input v-if="checked" class="accent-accent" :disabled checked type="checkbox" />
    <input v-else v-model="model" class="accent-accent" :disabled type="checkbox" />

    <span v-if="!right" class="flex items-center gap-1">
      {{ label }} <HelpHint v-if="helpLink" :helpLink :tooltip="props.helpTooltip" />
    </span>
  </label>
</template>
