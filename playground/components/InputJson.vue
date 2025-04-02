<script lang="ts" setup>
import { ref, watch } from 'vue';
import { twMerge } from 'tailwind-merge';
import { useTextareaAutosize } from '@vueuse/core';
type TwMergeArgument = Parameters<typeof twMerge>[0];

// We don't use 'defineModel' because here it creates more complexity compiles, conceptually.
const props = defineProps<{
  modelValue: unknown; // Our 'Object' type
  label?: string;
  inputClass?: TwMergeArgument;
  placeholder?: string;
  rows?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void;
}>();

const isValid = ref(true);

const { textarea, input } = useTextareaAutosize({ styleProp: 'minHeight' });

let modelGuard = false;

// Watch the parent's object -> update local JSON string
watch(
  () => props.modelValue,
  (obj) => {
    if (modelGuard) {
      modelGuard = false;
      return;
    }

    input.value = obj ? JSON.stringify(obj) : '';
    isValid.value = true;
  },
  { immediate: true },
);

// Watch our local text -> parse JSON -> emit up
watch(input, (str) => {
  if (!str.trim()) {
    // empty
    emit('update:modelValue', undefined);
    isValid.value = true;
    return;
  }
  try {
    const parsed = JSON.parse(str.trim());
    // optionally check if parsed is object/array
    if (Array.isArray(parsed) || typeof parsed === 'object') {
      modelGuard = true;
      emit('update:modelValue', parsed);
      isValid.value = true;
    } else {
      emit('update:modelValue', undefined);
      isValid.value = false;
    }
  } catch {
    isValid.value = false;
    // we do NOT emit anything if invalid
  }
});
</script>

<template>
  <label class="inline-block">
    <div v-if="label" class="pl-1 text-sm">{{ label }}</div>
    <textarea
      ref="textarea"
      v-model="input"
      :class="
        twMerge(
          'w-full rounded-lg border bg-white px-1.5 py-0.5',
          inputClass,
          !isValid && 'border-red-500! text-red-600 ring-red-500!',
          '',
        )
      "
      :placeholder="placeholder || 'JSON object...'"
      :rows="rows || 1"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      type="text"
    />
  </label>
</template>

<style scoped>
/* Reset scrollbar to ensure correct height for large texts */
textarea {
  -ms-overflow-style: none;
  resize: none;
  scrollbar-width: none;
}
textarea::-webkit-scrollbar {
  display: none;
}
</style>
