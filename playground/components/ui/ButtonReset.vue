<script lang="ts" setup>
import { twMerge } from 'tailwind-merge';
import IconReset from './IconReset.vue';
const props = defineProps({
  class: {
    type: null,
    default: undefined,
  },
});
</script>
<template>
  <button :class="twMerge('hover:text-accent cursor-pointer text-slate-400', props.class)">
    <IconReset />
  </button>
</template>
