<script lang="ts" setup>
import { computed, ref, type PropType } from 'vue';
import { ignorableWatch } from '@vueuse/core';
import { twMerge } from 'tailwind-merge';
import TogglableButton from './TogglableButton.vue';
type TwMergeArgument = Parameters<typeof twMerge>[0];

const props = defineProps({
  options: {
    type: [Array, Object],
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  buttonClass: {
    type: [Array, String, Boolean, null, undefined] as PropType<TwMergeArgument>,
    default: undefined,
  },
});

const model = defineModel({ type: undefined, required: true });
const internalModel = ref<string[]>([]);

const { ignoreUpdates: ignoreInternalUpdates } = ignorableWatch(internalModel, (newVal) => {
  ignoreModelUpdates(() => {
    if (!newVal.length) {
      model.value = undefined;
    } else if (newVal.length === 1) {
      model.value = newVal[0];
    } else {
      model.value = newVal;
    }
  });
});

// this one with "immediate" should go after anything it uses/calls inside
const { ignoreUpdates: ignoreModelUpdates } = ignorableWatch(
  model,
  (newVal) => {
    ignoreInternalUpdates(() => {
      if (!newVal) {
        internalModel.value = [];
      } else if (!Array.isArray(newVal)) {
        internalModel.value = [newVal as string];
      } else {
        internalModel.value = newVal;
      }
    });
  },
  { immediate: true },
);

const optionsObject = computed(() => {
  const options = Array.isArray(props.options)
    ? Object.fromEntries(
        props.options.map((item) => [typeof item === 'undefined' ? '-empty-' : item, item]),
      )
    : props.options;

  // if selected value not present among available options, add it so that the label become visible
  internalModel.value?.forEach((item) => {
    if (typeof item !== 'undefined' && !Object.values(options).includes(item)) {
      options[String(item)] = item;
    }
  });

  return options;
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="label">{{ label }}</div>

    <div class="flex flex-wrap gap-x-1.5 gap-y-2">
      <TogglableButton
        v-for="(value, key) in optionsObject"
        :key="key"
        v-model="internalModel"
        :class="props.buttonClass"
        :label="key"
        :value="value"
        type="checkbox"
      />
    </div>
  </div>
</template>
