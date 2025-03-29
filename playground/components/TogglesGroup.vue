<script lang="ts" setup>
import { ignorableWatch } from '@vueuse/core';
import { computed, ref } from 'vue';

const props = defineProps({
  options: {
    type: [Array, Object],
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
});

const model = defineModel({ type: undefined, required: true });
const internalModel = ref<string[]>([]);

const { ignoreUpdates: ignoreModelUpdates } = ignorableWatch(model, (newVal) => {
  ignoreInternalUpdates(() => {
    if (!newVal) {
      internalModel.value = [];
    } else if (!Array.isArray(newVal)) {
      internalModel.value = [newVal as string];
    } else {
      internalModel.value = newVal;
    }
  });
});

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

const optionsObject = computed(() => {
  const options = Array.isArray(props.options)
    ? Object.fromEntries(
        props.options.map((item) => [typeof item === 'undefined' ? '-empty-' : item, item]),
      )
    : props.options;

  // if selected value not in options, add it
  internalModel.value?.forEach((item) => {
    if (typeof item !== 'undefined' && !((item as any) in options)) {
      options[String(item)] = item;
    }
  });

  return options;
});
</script>

<template>
  <div>
    <div v-if="label">{{ label }}</div>
    <div class="flex flex-wrap gap-x-1.5 gap-y-2">
      <label
        v-for="(value, key) in optionsObject"
        :key="key"
        class="has-[input:checked]:bg-accent rounded-lg bg-slate-50 px-1.5 py-0.5 text-sm not-has-[input:checked]:cursor-pointer not-has-[input:checked]:shadow-md not-has-[input:checked]:hover:bg-slate-100 has-[input:checked]:text-white"
      >
        <input v-model="internalModel" class="hidden" :value="value" type="checkbox" />
        {{ key }}
      </label>
    </div>
  </div>
</template>
