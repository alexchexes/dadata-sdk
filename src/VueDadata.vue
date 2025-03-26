<script lang="ts" setup>
import { DEFAULT_CLASSES, DEFAULT_SHOW_ON_FOCUS } from '@/const';
import { DEFAULT_COUNT, DEFAULT_SUGGEST_TYPE } from '@/const/api';
import { useMergedWithDefaults } from './composables/useMergedWithDefaults';
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
} from '@/types/api';
import type { LocationsBoost, VueDadataClasses, ShowOnFocusOption } from '@/types';
import { computed, type InputHTMLAttributes, type PropType } from 'vue';
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
    default: () => ({}),
  },
  /**
   * Controls whether the suggestions list is shown when the input field is focused.
   *
   * - `'no_selection'` (default): Suggestions will be shown on focus **when these conditions met**:
   *   1. The user started typing and the suggestions list was loaded
   *   2. The user did not select any suggestion (or selected one and then changed the input)
   *   3. The input was unfocused (suggestions list was hidden)
   *   4. The input is focused again
   *
   * - `false`: Disables the behavior described above.
   *
   * - `'always'`: Suggestions will always be shown when the input is focused (if not empty).
   */
  showOnFocus: {
    type: [Boolean, String] as PropType<ShowOnFocusOption>,
    default: DEFAULT_SHOW_ON_FOCUS,
  },
  selectOnBlur: {
    type: Boolean,
    default: false,
  },
  selectOnEnter: {
    type: Boolean,
    default: true,
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
  /**
   * Additional attributes to apply to the internal `<input>` element.
   *
   * This can be used to control browser-specific behaviors such as
   * `autocomplete`, `autocapitalize`, `inputmode`, `enterkeyhint`, etc.
   *
   * Critical attributes and event handlers (`value`, `onInput`, `onBlur`, etc.) are managed
   * internally and cannot be overridden.
   *
   * * The `disabled` state must be controlled via the `disabled` prop on `VueDadata`,
   * not through `inputAttributes`.
   * * To listen for `onFocus` or `onBlur`, bind `@focus`/`@blur` to the `VueDadata` component itself.
   *
   * **Example usage:**
   * ```vue
   * <VueDadata :input-attributes="{ autocomplete: 'one-time-code', inputmode: 'numeric' }" />
   * ```
   */
  inputAttributes: {
    type: Object as PropType<
      Omit<
        InputHTMLAttributes,
        'disabled' | 'value' | 'onBlur' | 'onFocus' | 'onInput' | 'onKeydown' | 'onChange'
      >
    >,
    default: () => ({}),
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
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();
export type VueDadataEmits = typeof emit;

const mergedClasses = useMergedWithDefaults<VueDadataClasses>(DEFAULT_CLASSES, props.classes);

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
  suggestionsVisible,
  navigatedIndex,
  suggestionsList,
  canClear,

  onInputChange,
  onKeyPress,
  onInputFocus,
  onInputBlur,
  onSuggestionClick,
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

      ...props.inputAttributes,

      disabled: props.disabled,
      value: visibleQuery.value,

      onBlur: onInputBlur,
      onFocus: onInputFocus,
      onInput: onInputChange,
      onKeydown: onKeyPress,
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
      v-if="inputFocused && suggestionsVisible && suggestionsList.length && !disabled"
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
          @mousedown.prevent="onSuggestionClick(index)"
        />
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
