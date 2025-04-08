<script lang="ts" setup>
import ButtonReset from './ui/ButtonReset.vue';

defineProps<{
  canReset?: boolean;
  heading?: string;
  headingClass?: any;
}>();

const emit = defineEmits(['resetClick', 'headingClick']);
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl bg-slate-50 px-3 py-2 shadow-lg">
    <div v-if="heading || canReset" class="flex gap-2">
      <h3
        v-if="heading"
        class="text-lg font-semibold"
        :class="headingClass"
        @click="emit('headingClick')"
      >
        {{ heading }}
      </h3>

      <ButtonReset v-if="canReset" :title="`Reset ${heading}`" @click="emit('resetClick')" />
    </div>

    <slot></slot>
  </div>
</template>
