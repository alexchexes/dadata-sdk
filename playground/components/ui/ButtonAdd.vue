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
  <button :class="twMerge('text-accent cursor-pointer hover:text-green-700', props.class)">
    <svg
      v-if="outline"
      class="size-[inherit]"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4c4.411 0 8 3.589 8 8s-3.589 8-8 8s-8-3.589-8-8s3.589-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 9h-4V7h-2v4H7v2h4v4h2v-4h4z"
        fill="currentColor"
      />
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
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z"
        fill="currentColor"
      />
    </svg>
  </button>
</template>
