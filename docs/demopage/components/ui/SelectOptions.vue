<script lang="ts" setup>
import { computed } from 'vue';
import HelpHint from './HelpHint.vue';

const props = defineProps({
  options: {
    type: [Object, Array],
    default: () => ({}),
  },
  label: {
    type: String,
    default: '',
  },
  addEmptyOption: {
    type: Boolean,
    default: true,
  },
  helpLink: {
    type: String,
    default: '',
  },
});
const model = defineModel({ type: null });

const optionsObject = computed(() =>
  Array.isArray(props.options)
    ? Object.fromEntries(props.options.map((item) => [item, item]))
    : props.options,
);
</script>

<template>
  <label class="flex flex-col gap-1">
    <div v-if="label">
      {{ label }}
      <HelpHint v-if="helpLink" :helpLink />
    </div>

    <select v-model="model" class="rounded-lg border bg-white dark:bg-(--vp-input-bg-color)">
      <option v-if="addEmptyOption" :value="undefined"></option>
      <option v-for="(value, key) in optionsObject" :key="key" :value="value">
        {{ key }}
      </option>
    </select>
  </label>
</template>
