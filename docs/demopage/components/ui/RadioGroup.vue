<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';
import { type PropType, computed } from 'vue';

import HelpHint from './HelpHint.vue';
import TogglableButton from './TogglableButton.vue';

type TwMergeArgument = Parameters<typeof twMerge>[0];

const props = defineProps({
  options: {
    type: [Array, Object],
    default: () => ({}),
  },
  label: {
    type: String,
    default: '',
  },
  buttonClass: {
    type: [Array, String, Boolean, null, undefined] as PropType<TwMergeArgument>,
    default: undefined,
  },
  helpLink: {
    type: String,
    default: '',
  },
  helpTooltip: {
    type: Boolean,
    default: false,
  },
});

const model = defineModel({ type: null });

const optionsObject = computed(() =>
  Array.isArray(props.options)
    ? Object.fromEntries(
        props.options.map((item) => [typeof item === 'undefined' ? 'any' : item, item]),
      )
    : props.options,
);
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="label" class="inline-flex items-center gap-1">
      {{ label }}
      <HelpHint v-if="helpLink" :helpLink :tooltip="props.helpTooltip" />
    </div>

    <div class="flex flex-wrap gap-x-1.5 gap-y-2">
      <TogglableButton
        v-for="(value, key) in optionsObject"
        :key="key"
        v-model="model"
        :class="props.buttonClass"
        :label="key"
        :value="value"
        type="radio"
      />
    </div>
  </div>
</template>
