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
  wrapperClass: mergedClasses.value.suggestionItem,
  highlightTag: 'mark',
  highlightClass: mergedClasses.value.highlightedText,
}));

const optionalInputProps = computed(
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
    }) satisfies InputHTMLAttributes,
);

const coreInputProps = computed(
  () =>
    ({
      disabled: options.disabled,
      value: visibleQuery.value,

      onBlur: handleInputBlur,
      onFocus: handleInputFocus,
      onInput: handleInputChange,
      onKeydown: handleKeyPress,
    }) satisfies InputHTMLAttributes,
);

const allInputProps = computed<InputHTMLAttributes>(
  () =>
    ({
      ...optionalInputProps.value,
      ...coreInputProps.value,
    }) satisfies InputHTMLAttributes,
);

const suggestionsHintShown = computed(
  () => suggestionsList.value.length && options.suggestionsHint,
);
const noSuggestionsHintShown = computed(
  () => !suggestionsList.value.length && options.noSuggestionsHint,
);

const hintShown = computed(() => suggestionsHintShown.value || noSuggestionsHintShown.value);
</script>

<template>
  <div :class="mergedClasses.container">
    <!-- Slot for the whole input wrapper. User can pass his custom input here -->
    <slot name="inputWrapper" :allInputProps :coreInputProps>
      <!-- Input wrapper -->
      <div :class="mergedClasses.inputWrapper">
        <!-- Slot for the input only, preserve the wrapper. User can pass his custom input here as well -->
        <slot name="input" :allInputProps :coreInputProps>
          <input v-bind="allInputProps" />
        </slot>

        <!-- Slot for loaders, custom clear buttons, etc -->
        <slot name="inputOverlay"></slot>

        <!-- Build-in clear button -->
        <button
          v-if="options.showClearButton && canClear"
          :class="mergedClasses.clearButton"
          @mousedown.prevent="clear"
        >
          <!-- Slot for the clear button icon only -->
          <slot name="clearButtonIcon">
            <IconCross />
          </slot>
        </button>
      </div>
    </slot>

    <!-- The dropdown -->
    <div v-if="isDropdownVisible" :class="mergedClasses.dropdown">
      <!-- Hint/slot -->
      <slot name="hint">
        <div v-if="hintShown" :class="mergedClasses.hint" @mousedown.prevent>
          <template v-if="suggestionsHintShown"> {{ options.suggestionsHint }} </template>
          <template v-else-if="noSuggestionsHintShown"> {{ options.noSuggestionsHint }} </template>
        </div>
      </slot>

      <!-- All suggestions items / slot -->
      <slot name="suggestions" :handleSuggestionClick :navigatedIndex :suggestionsList>
        <!-- Suggestion item -->
        <template v-for="(suggestion, index) in suggestionsList" :key="index">
          <!-- Slot for the whole element -->
          <slot
            name="suggestionItem"
            :handleSuggestionClick
            :index
            :isNavigated="index === navigatedIndex"
            :suggestion
          >
            <!-- If 'suggestionItemContent' slot is passed in -->
            <template v-if="$slots.suggestionItemContent">
              <button @mousedown.prevent="handleSuggestionClick(index)">
                <!-- Slot only for contents (no need to handle clicks) -->
                <slot
                  name="suggestionItemContent"
                  :isNavigated="index === navigatedIndex"
                  :suggestion
                />
              </button>
            </template>

            <!-- If no slot passed, render element by vue-word-highlighter -->
            <template v-else>
              <WordHighlighter
                :class="index === navigatedIndex ? mergedClasses.navigatedSuggestionItem : ''"
                :query="queryModel"
                :textToHighlight="suggestion.value"
                wrapperTag="button"
                v-bind="highlightOptions"
                @mousedown.prevent="handleSuggestionClick(index)"
              />
            </template>
          </slot>
        </template>
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
