<script lang="ts" setup>
import ButtonReset from './ui/ButtonReset.vue';
import FadeOverlay from './ui/FadeOverlay.vue';
import IconDown from './ui/IconDown.vue';

defineProps<{
  resetLable?: string;
  canReset?: boolean;
  heading?: string;
  headingClass?: any;
}>();

const collapsed = defineModel({ type: Boolean });

const emit = defineEmits(['resetClick', 'headingClick']);
</script>

<template>
  <div
    class="relative flex w-full flex-col gap-3 overflow-hidden rounded-xl border-1 border-(--vp-c-divider) bg-[#f6f7f8] px-3 py-2 dark:bg-(--vp-c-bg-soft)"
    :class="collapsed && 'h-20'"
  >
    <div v-if="heading || canReset" class="flex gap-2">
      <h3
        v-if="heading"
        class="group cursor-pointer text-lg font-semibold hover:text-(--vp-c-text-2)"
        :class="headingClass"
        @click="collapsed = true"
      >
        {{ heading }}

        <IconDown
          class="inline-block text-(--vp-c-text-3) opacity-50 transition-transform group-hover:opacity-30"
          :class="collapsed && '-rotate-180'"
        />
      </h3>

      <ButtonReset
        v-if="canReset"
        :title="resetLable || `Reset ${heading}`"
        @click="emit('resetClick')"
      />
    </div>

    <slot></slot>

    <FadeOverlay v-if="collapsed" @click="collapsed = false" />
  </div>
</template>
