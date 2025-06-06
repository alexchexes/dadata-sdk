<script lang="ts" setup>
import IconHelp from './IconHelp.vue';

defineProps<{
  helpLink: string;
}>();
</script>

<template>
  <a
    class="size-5 -translate-y-[1px] text-(--vp-c-text-3) opacity-65 hover:text-(--vp-c-brand-1) hover:opacity-100"
    :href="helpLink"
    rel="noopener"
    target="_blank"
  >
    <IconHelp class="inline-block size-[inherit] translate-y-[inherit]" />
  </a>
</template>
