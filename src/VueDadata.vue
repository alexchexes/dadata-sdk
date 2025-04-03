<script lang="ts" setup>
import { DEFAULT_CLASSES, DEFAULT_BOOL_TRUE_OPTIONS } from '@/const';

import { useSuggestions } from '@/composables/useSuggestions';
import IconCross from '@/IconCross.vue';
import type { VueDadataClasses, VueDadataOptions } from '@/types';
import { computed, type InputHTMLAttributes, type PropType } from 'vue';
import WordHighlighter from 'vue-word-highlighter';
import { mergeDefined } from './utils';
import type { DadataSuggestion } from './types/api';

const props = withDefaults(defineProps<VueDadataOptions>(), {
  // we have to do this because if we don't, Vue will set every boolean to `false`
  ...DEFAULT_BOOL_TRUE_OPTIONS,
});

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

const {
  visibleQuery,
  isDropdownVisible,
  navigatedIndex,
  suggestionsList,
  canClear,
  options,

  handleInputChange,
  handleKeyPress,
  handleInputFocus,
  handleInputBlur,
  handleSuggestionClick,
  clear,
} = useSuggestions(queryModel, suggestionModel, props, emit);

const mergedClasses = computed<VueDadataClasses>(() =>
  mergeDefined(DEFAULT_CLASSES, options.classes || {}),
);

const highlightOptions = computed(() => ({
  caseSensitive: false,
  splitBySpace: true,
  wrapperTag: 'button',
  wrapperClass: mergedClasses.value.suggestionItem,
  highlightTag: 'mark',
  highlightClass: mergedClasses.value.highlightedText,
}));

const inputAttrs = computed(
  () =>
    ({
      type: 'text',
      class: mergedClasses.value.input,

      name: options.inputName,
      placeholder: options.placeholder,

      autocapitalize: 'off',
      autocomplete: 'off',
      autocorrect: 'off',
      spellcheck: false,

      ...(props.inputAttributes || {}),

      disabled: options.disabled,
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
        v-if="options.showClearButton && canClear"
        :class="mergedClasses.clearButton"
        @mousedown.prevent="clear"
      >
        <slot name="clearButtonIcon">
          <IconCross />
        </slot>
      </button>
    </div>

    <div v-if="isDropdownVisible" :class="mergedClasses.dropdown">
      <slot
        name="suggestions"
        :activeIndex="navigatedIndex"
        :query="queryModel"
        :suggestion="suggestionModel"
        :suggestionsList="suggestionsList"
      >
        <slot name="hint">
          <div
            v-if="
              (suggestionsList.length && options.suggestionsHint) ||
              (!suggestionsList.length && options.noSuggestionsHint)
            "
            :class="mergedClasses.hint"
            @mousedown.prevent
          >
            <template v-if="suggestionsList.length && options.suggestionsHint">
              {{ options.suggestionsHint }}
            </template>
            <template v-else-if="!suggestionsList.length && options.noSuggestionsHint">
              {{ options.noSuggestionsHint }}
            </template>
          </div>
        </slot>

        <WordHighlighter
          v-for="(suggestion, index) in suggestionsList"
          :key="index"
          :class="index === navigatedIndex ? mergedClasses.navigatedSuggestionItem : ''"
          :query="queryModel"
          :textToHighlight="suggestion.value"
          v-bind="highlightOptions"
          @mousedown.prevent="handleSuggestionClick(index)"
        />
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
