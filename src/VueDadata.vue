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
import IconCross from './IconCross.vue';

const props = defineProps({
  token: {
    type: String,
    required: true,
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
  /** Controls browser built-in autocompletion. If the default `off` doesn't work for you, try "one-time-code" or "new-password" */
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
  count: {
    type: Number,
    default: 10,
  },
  /** Whether to send additional request after suggestion was selected to obtain data like coordinates and city_district */
  enrichOnSelect: {
    type: Boolean,
    default: true,
  },
  /** Whether to add space to input after suggestion was selected */
  addSpace: {
    type: Boolean,
    default: true,
  },
  continueSelecting: {
    type: Boolean,
    default: false,
  },
  showClearButton: {
    type: Boolean,
    default: false,
  },
});
export type VueDadataProps = typeof props;

const queryModel = defineModel({ type: String, required: true });

const suggestionModel = defineModel('suggestion', {
  type: Object as PropType<AddressSuggestion | undefined>,
});

const emit = defineEmits<{
  'error': [error: unknown];
  'enriched': [suggestion: AddressSuggestion];
}>();
export type VueDadataEmits = typeof emit;

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
  visibleQuery,
  inputFocused,
  suggestionsVisible,
  activeIndex,
  suggestionsList,
  canClear,

  onInputChange,
  onKeyPress,
  onInputFocus,
  onInputBlur,
  onSuggestionClick,
  clear,
} = useSuggestions(queryModel, suggestionModel, props, emit);
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

      <button
        v-if="props.showClearButton && canClear"
        :class="proxyClasses.clearButton"
        @mousedown.prevent="clear"
      >
        <slot name="clearButtonIcon">
          <IconCross />
        </slot>
      </button>
    </div>

    <div
      v-if="inputFocused && suggestionsVisible && suggestionsList.length && !disabled"
      :class="proxyClasses.suggestions"
    >
      <slot
        name="suggestions"
        :active-index="activeIndex"
        :query="queryModel"
        :suggestion="suggestionModel"
        :suggestions-list="suggestionsList"
      >
        <WordHighlighter
          v-for="(suggestion, index) in suggestionsList"
          :key="index"
          :class="index === activeIndex ? proxyClasses.suggestionCurrentItem : ''"
          :query="queryModel"
          :text-to-highlight="suggestion.value"
          v-bind="mergedHighlightOptions"
          @mousedown.prevent="onSuggestionClick(index)"
        />
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
