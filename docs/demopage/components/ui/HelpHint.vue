<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import HelpTooltip from './HelpTooltip.vue';
import IconHelp from './IconHelp.vue';

const props = defineProps<{
  helpLink: string;
  tooltip?: boolean;
  tooltipLang?: 'en' | 'ru';
  tooltipProperty?: string;
}>();

const isExternal = computed(() => /^https?:\/\//.test(props.helpLink));
const anchorRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const isTooltipOpen = ref(false);
const isTooltipPinned = ref(false);
const tooltipStyle = ref<Record<string, string>>({});
const hasTooltip = computed(() => Boolean(resolvedTooltipProperty.value));

const parsedUrl = computed(() => {
  try {
    return new URL(props.helpLink, 'https://dadata-sdk.local');
  } catch {
    return null;
  }
});

const resolvedTooltipProperty = computed(() => {
  if (props.tooltipProperty) {
    return props.tooltipProperty;
  }

  if (!props.tooltip || !parsedUrl.value || !/\/vue\/?$/.test(parsedUrl.value.pathname)) {
    return null;
  }

  const property = parsedUrl.value.hash.replace(/^#/, '').trim();
  return property || null;
});

const resolvedTooltipLang = computed(() => {
  if (props.tooltipLang) {
    return props.tooltipLang;
  }

  const localeMatch = parsedUrl.value?.pathname.match(/\/(en|ru)(?:\/|$)/);
  return (localeMatch?.[1] as 'en' | 'ru' | undefined) || 'en';
});

let closeTimeoutId: number | undefined;
let openTimeoutId: number | undefined;

const OPEN_DELAY_MS = 220;
const CLOSE_DELAY_MS = 120;

const clearOpenTimeout = () => {
  if (typeof openTimeoutId !== 'undefined') {
    window.clearTimeout(openTimeoutId);
    openTimeoutId = undefined;
  }
};

const clearCloseTimeout = () => {
  if (typeof closeTimeoutId !== 'undefined') {
    window.clearTimeout(closeTimeoutId);
    closeTimeoutId = undefined;
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const updateTooltipPosition = () => {
  if (!anchorRef.value || !tooltipRef.value) {
    return;
  }

  const anchorRect = anchorRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const viewportPadding = 12;
  const gap = 8;
  const isDesktop = window.innerWidth >= 768;
  const maxLeft = Math.max(
    viewportPadding,
    window.innerWidth - tooltipRect.width - viewportPadding,
  );
  const maxTop = Math.max(
    viewportPadding,
    window.innerHeight - tooltipRect.height - viewportPadding,
  );

  let left = anchorRect.right + gap;
  let top = anchorRect.bottom + gap;

  if (isDesktop) {
    const leftPlacement = anchorRect.left - tooltipRect.width - gap;
    left =
      left + tooltipRect.width <= window.innerWidth - viewportPadding
        ? left
        : leftPlacement >= viewportPadding
          ? leftPlacement
          : clamp(anchorRect.left, viewportPadding, maxLeft);

    top = clamp(
      anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2,
      viewportPadding,
      maxTop,
    );
  } else {
    const topPlacement = anchorRect.bottom + gap;
    const bottomPlacement = anchorRect.top - tooltipRect.height - gap;

    top =
      topPlacement + tooltipRect.height <= window.innerHeight - viewportPadding
        ? topPlacement
        : bottomPlacement >= viewportPadding
          ? bottomPlacement
          : clamp(anchorRect.bottom + gap, viewportPadding, maxTop);

    left = clamp(anchorRect.right - tooltipRect.width, viewportPadding, maxLeft);
  }

  tooltipStyle.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  };
};

const handleViewportChange = () => {
  if (isTooltipOpen.value) {
    updateTooltipPosition();
  }
};

const handleOutsidePointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null;

  if (!target) {
    return;
  }

  if (anchorRef.value?.contains(target) || tooltipRef.value?.contains(target)) {
    return;
  }

  closeTooltip();
};

const openTooltip = async (pin = false) => {
  if (!resolvedTooltipProperty.value) {
    return;
  }

  clearOpenTimeout();
  clearCloseTimeout();
  isTooltipPinned.value = pin;

  if (!isTooltipOpen.value) {
    isTooltipOpen.value = true;
    await nextTick();
  }

  updateTooltipPosition();
};

const scheduleOpenTooltip = () => {
  if (!resolvedTooltipProperty.value) {
    return;
  }

  clearCloseTimeout();

  if (isTooltipOpen.value) {
    updateTooltipPosition();
    return;
  }

  clearOpenTimeout();
  openTimeoutId = window.setTimeout(() => {
    openTooltip(false);
    openTimeoutId = undefined;
  }, OPEN_DELAY_MS);
};

const closeTooltip = () => {
  clearOpenTimeout();
  clearCloseTimeout();
  isTooltipPinned.value = false;
  isTooltipOpen.value = false;
};

const keepTooltipOpen = () => {
  clearOpenTimeout();
  clearCloseTimeout();
};

const handleAnchorClick = (event: MouseEvent) => {
  if (!hasTooltip.value) {
    return;
  }

  event.preventDefault();

  if (!isTooltipOpen.value) {
    void openTooltip(true);
    return;
  }

  if (!isTooltipPinned.value) {
    isTooltipPinned.value = true;
    keepTooltipOpen();
    return;
  }

  if (isTooltipOpen.value) {
    closeTooltip();
  }
};

const scheduleClose = () => {
  if (isTooltipPinned.value) {
    return;
  }

  clearOpenTimeout();
  clearCloseTimeout();
  closeTimeoutId = window.setTimeout(() => {
    isTooltipOpen.value = false;
    closeTimeoutId = undefined;
  }, CLOSE_DELAY_MS);
};

watch(isTooltipOpen, (open) => {
  if (open) {
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('pointerdown', handleOutsidePointerDown, true);
    return;
  }

  window.removeEventListener('resize', handleViewportChange);
  window.removeEventListener('scroll', handleViewportChange, true);
  window.removeEventListener('pointerdown', handleOutsidePointerDown, true);
});

watch(resolvedTooltipProperty, async (property) => {
  if (!property) {
    closeTooltip();
    return;
  }

  if (isTooltipOpen.value) {
    await nextTick();
    updateTooltipPosition();
  }
});

onBeforeUnmount(() => {
  closeTooltip();
  clearOpenTimeout();
  window.removeEventListener('resize', handleViewportChange);
  window.removeEventListener('scroll', handleViewportChange, true);
  window.removeEventListener('pointerdown', handleOutsidePointerDown, true);
});
</script>

<template>
  <span
    ref="anchorRef"
    class="inline-flex size-5 shrink-0 items-center justify-center align-middle leading-none"
    @focusin="openTooltip(false)"
    @focusout="scheduleClose"
    @mouseenter="scheduleOpenTooltip"
    @mouseleave="scheduleClose"
  >
    <a
      :class="[
        'inline-flex size-[inherit] items-center justify-center rounded-full transition-colors',
        isTooltipPinned
          ? 'bg-(--vp-c-brand-soft) text-(--vp-c-brand-1) opacity-100'
          : 'text-(--vp-c-text-3) opacity-65 hover:text-(--vp-c-brand-1) hover:opacity-100',
      ]"
      :href="helpLink"
      :rel="isExternal ? 'noopener' : undefined"
      :target="isExternal ? '_blank' : undefined"
      @click="handleAnchorClick"
      @keydown.esc="closeTooltip"
    >
      <IconHelp class="inline-block size-[inherit]" />
    </a>

    <Teleport to="body">
      <Transition name="help-tooltip-fade">
        <div
          v-if="isTooltipOpen && resolvedTooltipProperty"
          ref="tooltipRef"
          class="pointer-events-auto fixed z-[100]"
          :style="tooltipStyle"
          role="tooltip"
          @focusin="keepTooltipOpen"
          @focusout="scheduleClose"
          @keydown.esc="closeTooltip"
          @mouseenter="keepTooltipOpen"
          @mouseleave="scheduleClose"
        >
          <HelpTooltip
            :docsLink="helpLink"
            :property="resolvedTooltipProperty"
            :lang="resolvedTooltipLang"
          />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.help-tooltip-fade-enter-active,
.help-tooltip-fade-leave-active {
  transition: opacity 0.16s ease;
}

.help-tooltip-fade-enter-from,
.help-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
