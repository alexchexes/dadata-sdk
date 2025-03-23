<script lang="ts" setup>
import { computed } from 'vue';
import { DEFAULT_CLASSES, DEFAULT_HIGHLIGHT_OPTIONS, KeyEvent } from '@/const';
import { DEFAULT_COUNT, DEFAULT_SUGGEST_TYPE } from '@/const/api';
import { useClasses } from '@/composables/useClasses';
import { useHighlightOptions } from '@/composables/useHighlightOptions';
import { useSuggestions } from '@/composables/useSuggestions';
import IconCross from '@/IconCross.vue';
import type {
  AddressSuggestion,
  BoundType,
  DivisionType,
  Language,
  LocationRestriction,
  RadiusFilter,
  SuggestType,
} from './types/api';
import type { LocationsBoost, VueDadataClasses, HighlightOptions } from './types';
import type { PropType, ComputedRef } from 'vue';
import WordHighlighter from 'vue-word-highlighter';

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
  httpCache: {
    type: Boolean,
    default: true,
  },
  debounceWait: {
    type: Number,
    default: 100,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  suggestType: {
    type: String as PropType<SuggestType>,
    default: DEFAULT_SUGGEST_TYPE,
  },
  /**
   * Type of territorial division: `ADMINISTRATIVE` or `MUNICIPAL`. Defaults to `ADMINISTRATIVE`.
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   */
  division: {
    type: String as PropType<DivisionType>,
    default: undefined,
  },
  fromBound: {
    type: String as PropType<BoundType>,
    default: undefined,
  },
  toBound: {
    type: String as PropType<BoundType>,
    default: undefined,
  },
  inputName: {
    type: String,
    default: 'vue-dadata-input',
  },
  /**
   * Restrict search by locations (API `locations` option). Max 10 items
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108}
   */
  locationsFilter: {
    type: [Object, Array] as PropType<LocationRestriction | LocationRestriction[]>,
    default: undefined,
  },
  /**
   * Restrict search by specified radius around specified latitude and longitude (API `locations_geo` option)
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806
   */
  radiusFilter: {
    type: Object as PropType<RadiusFilter>,
    default: undefined,
  },
  /**
   * Used in combination with locationsFilter. When set to true, the displayed address (the "value" field)
   * will have all segments removed up to and including the level specified in the restrictions.
   * For example, if the restriction specifies a region, the region will not appear in the suggestion;
   * if it specifies a city, both the region and the city will be omitted.
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737934
   */
  restrictValue: {
    type: Boolean,
    default: false,
  },
  /**
   * 'kladr_id' or array of 'kladr_id's of region or city that should be prioritized by Dadata when
   * it prepares list of suggestions on its side. Examples:
   * - `55` - Omsk region
   * - `63000001` - Samara city
   * - `6300000100000` - Samara city (full KLADR code)
   * - `[50, 77]` - Moscow and Moscow-City regions
   * Max 10 items
   */
  locationsBoost: {
    type: [Array, String, Number] as PropType<LocationsBoost>,
    default: undefined,
  },
  /** Language for displayed suggestions. `en` or `ru`. Default `ru`. `en` mostly just transliterates
   * pretty much everything */
  language: {
    type: String as PropType<Language>,
    default: 'ru',
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
  /**
   * Controls browser built-in autocompletion. If the default `off` doesn't work for you,
   * try "one-time-code" or "new-password"
   */
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
    default: DEFAULT_COUNT,
  },
  /**
   * Whether to send additional request after suggestion was selected to obtain data like coordinates
   * and city_district. When `restrictValue` is used, it also adds normal `value` instead of restricted to the suggestion object.
   */
  enrichOnSelect: {
    type: Boolean,
    default: true,
  },
  clearSuggestionOnChange: {
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

/** Max 300 characters */
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
