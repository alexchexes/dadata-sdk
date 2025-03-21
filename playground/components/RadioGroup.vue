<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  options: {
    type: [Array, Object],
    default: () => ({}),
  },
  label: {
    type: String,
    default: '',
  },
});
const model = defineModel({ type: null });
const optionsObject = computed(() => {
  if (Array.isArray(props.options)) {
    return Object.fromEntries(props.options.map((item) => [item, item]));
  }

  return props.options;
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
        <input v-model="model" class="hidden" :value="value" type="radio" />
        {{ key }}
      </label>
    </div>
  </div>
</template>
