<script lang="ts" setup>
import { computed } from 'vue';
import type { PropType, ComputedRef } from 'vue';
import WordHighlighter from 'vue-word-highlighter';
import { KeyEvent } from './types';
import type {
  BoundsType,
  LocationOptions,
  VueDadataClasses,
  HighlightOptions,
  AddressSuggestion,
} from './types';
import { DEFAULT_CLASSES, DEFAULT_HIGHLIGHT_OPTIONS } from './const';
import { useClasses } from './composables/useClasses';
import { useHighlightOptions } from './composables/useHighlightOptions';
import { useSuggestions } from './composables/useSuggestions';

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  suggestion: {
    type: Object as PropType<AddressSuggestion | undefined>,
    default: () => undefined,
  },
  placeholder: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: undefined,
  },
  debounceWait: {
    type: Number,
    default: 100,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fromBound: {
    type: String as PropType<BoundsType>,
    default: undefined,
  },
  toBound: {
    type: String as PropType<BoundsType>,
    default: undefined,
  },
  inputName: {
    type: String,
    default: 'vue-dadata-input',
  },
  locationOptions: {
    type: Object as PropType<LocationOptions>,
    default: undefined,
  },
  classes: {
    type: Object as PropType<VueDadataClasses>,
    default: () => DEFAULT_CLASSES,
  },
  highlightOptions: {
    type: Object as PropType<HighlightOptions>,
    default: () => DEFAULT_HIGHLIGHT_OPTIONS,
  },
  selectOnBlur: {
    type: Boolean,
    default: false,
  },
  selectOnEnter: {
    type: Boolean,
    default: true,
  },
  /** Controls browser built-in autocompletion. If "off" doesn't work for you, try "one-time-code" or "new-password" */
  inputAutocomplete: {
    type: String,
    default: 'off',
  },
  inputAutocapitalize: {
    type: String,
    default: 'off',
  },
  inputAutocorrect: {
    type: String,
    default: 'off',
  },
  inputSpellcheck: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:suggestion', 'handleError']);

const proxyClasses: ComputedRef<VueDadataClasses> = useClasses(props.classes);

const proxyHighlightOptions: ComputedRef<HighlightOptions> = useHighlightOptions(
  props.highlightOptions,
);

const mergedHighlightOptions = computed(() => {
  const wrapperClass = proxyHighlightOptions.value.wrapperClass
    ? proxyHighlightOptions.value.wrapperClass
    : proxyClasses.value.suggestionItem;

  const highlightClass = proxyHighlightOptions.value.highlightClass
    ? proxyHighlightOptions.value.highlightClass
    : proxyClasses.value.suggestionTextHighlight;

  return {
    ...proxyHighlightOptions.value,
    wrapperClass,
    highlightClass,
  };
});

const {
  queryProxy,
  visibleQuery,
  suggestionProxy,
  inputFocused,
  suggestionsVisible,
  activeIndex,
  suggestionsList,

  onInputChange,
  onKeyPress,
  onInputFocus,
  onInputBlur,
  onSuggestionClick,
} = useSuggestions(props, emit);
</script>

<template>
  <div :class="proxyClasses.container">
    <div :class="proxyClasses.inputWrapper">
      <input
        :name="inputName"
        :class="proxyClasses.input"
        :autocapitalize="inputAutocapitalize"
        :autocomplete="inputAutocomplete"
        :autocorrect="inputAutocorrect"
        :disabled="disabled"
        :placeholder="placeholder"
        :spellcheck="inputSpellcheck"
        :value="visibleQuery"
        type="text"
        @blur="onInputBlur"
        @focus="onInputFocus"
        @input="onInputChange"
        @keydown.down="onKeyPress($event, KeyEvent.Down)"
        @keydown.enter="onKeyPress($event, KeyEvent.Enter)"
        @keydown.esc="onKeyPress($event, KeyEvent.Esc)"
        @keydown.up="onKeyPress($event, KeyEvent.Up)"
      />
      <slot name="inputOverlay"></slot>
    </div>

    <div
      v-if="inputFocused && suggestionsVisible && suggestionsList.length && !disabled"
      :class="proxyClasses.suggestions"
    >
      <slot
        name="suggestions"
        :active-index="activeIndex"
        :query="queryProxy"
        :suggestion="suggestionProxy"
        :suggestions-list="suggestionsList"
      >
        <WordHighlighter
          v-for="(suggestion, suggestionIndex) in suggestionsList"
          :key="`suggestion_${suggestionIndex}`"
          :class="suggestionIndex === activeIndex ? proxyClasses.suggestionCurrentItem : ''"
          :query="queryProxy"
          :text-to-highlight="suggestion.value"
          v-bind="mergedHighlightOptions"
          @mousedown="onSuggestionClick(suggestionIndex)"
        />
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
