<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';
const props = defineProps({
  class: {
    type: null,
    default: undefined,
  },
  outline: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <button
    :class="
      twMerge('text-accent cursor-pointer hover:text-red-700 dark:hover:text-red-400', props.class)
    "
  >
    <svg
      v-if="outline"
      class="size-[inherit]"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M7.5 12h9" />
      </g>
    </svg>
    <svg
      v-else
      class="size-[inherit]"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m-5-8h10v-2H7z"
        fill="currentColor"
        fill-rule="evenodd"
      />
    </svg>
  </button>
</template>
