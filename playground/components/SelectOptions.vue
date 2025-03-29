<script lang="ts" setup>
import { computed } from 'vue';

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
});
const model = defineModel({ type: null });

const optionsObject = computed(() =>
  Array.isArray(props.options)
    ? Object.fromEntries(props.options.map((item) => [item, item]))
    : props.options,
);
</script>

<template>
  <label>
    <div v-if="label" class="pl-1 text-sm">{{ label }}</div>
    <select v-model="model" class="rounded-lg border bg-white">
      <option v-if="addEmptyOption" :value="undefined"></option>
      <option v-for="(value, key) in optionsObject" :key="key" :value="value">
        {{ key }}
      </option>
    </select>
  </label>
</template>
