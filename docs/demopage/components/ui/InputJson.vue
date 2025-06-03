<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
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
  allowArray?: boolean;
  modelModifiers?: Record<string, true>;
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
  modelGuard = true;
  try {
    const parsed = JSON.parse(str.trim());
    // optionally check if parsed is object/array
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed)) {
        if (!props.allowArray || !parsed.every((el) => el && typeof el === 'object')) {
          throw new Error();
        }
      }
      isValid.value = true;
      emit('update:modelValue', parsed);
    } else {
      throw new Error();
    }
  } catch {
    isValid.value = false;
    emit('update:modelValue', undefined);
  }
});

const inputProps = computed(() => ({
  class: twMerge(
    'w-full rounded-lg border bg-white dark:bg-(--vp-input-bg-color) px-1.5 py-0.5',
    props.inputClass,
    !isValid.value &&
      'border-red-500! text-red-600 ring-red-500! dark:text-red-400 dark:border-red-400! dark:ring-red-400!',
    '',
  ),
  placeholder: props.placeholder || 'JSON object...',
  rows: props.rows || 1,
  autocapitalize: 'off',
  autocomplete: 'off',
  autocorrect: 'off',
  spellcheck: false,
  type: 'text',
}));
</script>

<template>
  <label class="inline-flex">
    <div v-if="label">{{ label }}</div>
    <textarea v-if="modelModifiers?.lazy" ref="textarea" v-model.lazy="input" v-bind="inputProps" />
    <textarea v-else ref="textarea" v-model="input" v-bind="inputProps" />
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
