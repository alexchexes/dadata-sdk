<script lang="ts" setup>
import { DEFAULT_CLASSES } from '@/const';

import { useSuggestions } from '@/composables/useSuggestions';
import IconCross from '@/IconCross.vue';
import type { VueDadataClasses, VueDadataOptions } from '@/types';
import { computed, type InputHTMLAttributes, type PropType } from 'vue';
import WordHighlighter from 'vue-word-highlighter';
import { mergeDefined } from './utils';
import type { DadataSuggestion } from './types/api';

const props = defineProps<VueDadataOptions>();

/** Max 300 characters */
const queryModel = defineModel({ type: String, required: true });

const suggestionModel = defineModel('suggestion', {
  type: Object as PropType<DadataSuggestion | undefined>,
});

const emit = defineEmits<{
  /** emitted in case of any error (usually only network errors occurs) */
  'error': [error: unknown];
  /** emitted after selected suggestion was enriched in case `enrichOnSelect` props is `true` */
  'enriched': [suggestion: DadataSuggestion];
  /** emitted if attemp to enrich selected suggestion failed (in case `enrichOnSelect` props is `true`) */
  'enrichFail': [unrestricted_value: string];
  /** emitted whenever input is focused */
  'focus': [event: FocusEvent];
  /** emitted whenever input looses focus */
  'blur': [event: FocusEvent];
}>();
export type VueDadataEmits = typeof emit;

const mergedClasses = computed<VueDadataClasses>(() =>
  mergeDefined(DEFAULT_CLASSES, props.classes || {}),
);

const highlightOptions = computed(() => ({
  caseSensitive: false,
  splitBySpace: true,
  wrapperTag: 'button',
  wrapperClass: mergedClasses.value.suggestionItem,
  highlightTag: 'mark',
  highlightClass: mergedClasses.value.highlightedText,
}));

const {
  visibleQuery,
  inputFocused,
  areSuggestionsVisible,
  navigatedIndex,
  suggestionsList,
  canClear,

  handleInputChange,
  handleKeyPress,
  handleInputFocus,
  handleInputBlur,
  handleSuggestionClick,
  clear,
} = useSuggestions(queryModel, suggestionModel, props, emit);

const inputAttrs = computed(
  () =>
    ({
      type: 'text',
      class: mergedClasses.value.input,

      name: props.inputName,
      placeholder: props.placeholder,

      autocapitalize: 'off',
      autocomplete: 'off',
      autocorrect: 'off',
      spellcheck: false,

      ...(props.inputAttributes || {}),

      disabled: props.disabled,
      value: visibleQuery.value,

      onBlur: handleInputBlur,
      onFocus: handleInputFocus,
      onInput: handleInputChange,
      onKeydown: handleKeyPress,
    }) satisfies InputHTMLAttributes,
);
</script>

<template>
  <div :class="mergedClasses.container">
    <div :class="mergedClasses.inputWrapper">
      <input v-bind="inputAttrs" />

      <slot name="inputOverlay"></slot>

      <button
        v-if="props.showClearButton && canClear"
        :class="mergedClasses.clearButton"
        @mousedown.prevent="clear"
      >
        <slot name="clearButtonIcon">
          <IconCross />
        </slot>
      </button>
    </div>

    <div
      v-if="
        (inputFocused && areSuggestionsVisible && suggestionsList.length && !disabled) || forceShow
      "
      :class="mergedClasses.dropdown"
    >
      <slot
        name="suggestions"
        :active-index="navigatedIndex"
        :query="queryModel"
        :suggestion="suggestionModel"
        :suggestions-list="suggestionsList"
      >
        <WordHighlighter
          v-for="(suggestion, index) in suggestionsList"
          :key="index"
          :class="index === navigatedIndex ? mergedClasses.navigatedSuggestionItem : ''"
          :query="queryModel"
          :text-to-highlight="suggestion.value"
          v-bind="highlightOptions"
          @mousedown.prevent="handleSuggestionClick(index)"
        />
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
