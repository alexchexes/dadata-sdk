<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';

import HelpHint from './HelpHint.vue';

type TwMergeArgument = Parameters<typeof twMerge>[0];

const {
  inputClass = undefined,
  label = '',
  placeholder = '',
  helpLink = '',
  helpTooltip = false,
  type = 'text',
} = defineProps<{
  inputClass?: TwMergeArgument;
  label?: string;
  placeholder?: string;
  type?: string;
  helpLink?: string;
  helpTooltip?: boolean;
}>();

const model = defineModel({ type: null });
</script>
<template>
  <label class="inline-flex flex-col gap-1">
    <div v-if="label" class="inline-flex items-center gap-1">
      {{ label }}
      <HelpHint v-if="helpLink" :helpLink :tooltip="helpTooltip" />
    </div>

    <input
      v-model="model"
      :class="
        twMerge(
          'w-full rounded-lg border bg-white px-1.5 py-0.5 dark:bg-(--vp-input-bg-color)',
          inputClass,
        )
      "
      :placeholder
      :type
    />
  </label>
</template>
