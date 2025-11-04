<script lang="ts" setup>
import type {
  BankSuggestion,
  DeepPartial,
  PartyBySuggestion,
  PartyKzSuggestion,
  PartySuggestion,
} from '@dadata-sdk/api-types';
import { type InputHTMLAttributes, type PropType, computed, onMounted, useTemplateRef } from 'vue';

import IconCross from './IconCross.vue';
import { useSuggestions } from './composables/useSuggestions';
import { DEFAULT_CLASSES, DEFAULT_OPTIONS } from './const';
import type { DadataSuggestion, SelectType, VueDadataClasses, VueDadataOptions } from './types';
import { highlightHtml } from './utils';
import { highlightChunks, mergeDefined } from './utils';

const props = withDefaults(defineProps<VueDadataOptions>(), {
  // although we merge defaults in the composable, we also need to set them here
  // or Vue will set everything that allows boolean value to `false` (instead of `undefined`)
  ...DEFAULT_OPTIONS,
});

/** Max 300 characters */
const queryModel = defineModel({ type: String, required: true });

const suggestionModel = defineModel('suggestion', {
  type: Object as PropType<DadataSuggestion | undefined>,
});

const emit = defineEmits<{
  /** emitted in case of any error (usually only network errors occurs) */
  error: [error: unknown];
  /** emitted after suggestion is selected, whether by clicking on a suggestion in the dropdown, by pressing "Enter" or by auto-selecting when `selectOnBlur=true` */
  select: [suggestion: DadataSuggestion, selectType: SelectType];
  /** emitted after selected suggestion was enriched in case `enrichOnSelect` props is `true` */
  enriched: [suggestion: DadataSuggestion, diff: DeepPartial<DadataSuggestion> | null];
  /** emitted if attemp to enrich selected suggestion failed (in case `enrichOnSelect` props is `true`) */
  enrichFail: [unrestricted_value: string];
  /** emitted whenever input is focused */
  focus: [event: FocusEvent];
  /** emitted whenever input looses focus */
  blur: [event: FocusEvent];
}>();
export type VueDadataEmits = typeof emit;

const inputRef = useTemplateRef('inputRef');

const {
  visibleQuery,
  isDropdownVisible,
  isFocused,
  navigatedIndex,
  suggestionsList,
  canClear,
  options,

  handleInputChange,
  handleKeyPress,
  handleInputFocus,
  handleInputBlur,
  handleSuggestionClick,

  update,
  clear,
  show,
  hide,
} = useSuggestions(queryModel, suggestionModel, props, emit);

onMounted(() => {
  if (options.focusOnMounted) {
    inputRef.value?.focus();
  }
});

const mergedClasses = computed<VueDadataClasses>(() =>
  mergeDefined(DEFAULT_CLASSES, options.classes || {}),
);

const browserAutoProps = {
  autocapitalize: 'off',
  autocomplete: 'off',
  autocorrect: 'off',
  spellcheck: false,
} as const;

const optionalInputProps = computed(
  () =>
    ({
      type: 'text',
      class: mergedClasses.value.input,

      name: options.inputName,
      placeholder: options.placeholder,

      ...browserAutoProps,
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

const prepareSubtitleHtml = (suggestion: DadataSuggestion): string => {
  let subtitle = '';

  // // TODO: For `address` we need to show history_values
  // // only if query part doesn't match `value` but matches one of `history_values`.
  // // If we show in all cases when history_values is present, we have odd notes like
  // // like "бывш. Ленинград" for "г Санкт-Петербург"
  // if (options.suggestType === 'address') {
  //   const addrSuggestion = suggestion as BaseAddressSuggestion;
  //   if (addrSuggestion.data.history_values?.length) {
  //     subtitle = 'бывш. ' + addrSuggestion.data.history_values?.join(', ');
  //   }
  // }

  // TODO: For `party` we need to show additional info based on what was is matches to the query.
  // Default should be `inn` but if 'party' was found by ogrn, then show ogrn, etc
  if (options.suggestType === 'party') {
    const partySuggestion = suggestion as PartySuggestion;
    subtitle = `${partySuggestion.data.inn} ${partySuggestion.data.address?.value}`;
  }

  // TODO: For `party` we need to show additional info based on what was is matches to the query.
  // Default should be `inn` but if 'party' was found by ogrn, then show ogrn, etc
  else if (options.suggestType === 'bank') {
    const bankSuggestion = suggestion as BankSuggestion;
    subtitle = `${bankSuggestion.data.bic} ${bankSuggestion.data.address?.value}`;
  }

  if (!subtitle) {
    return '';
  }

  return highlightHtml(subtitle, queryModel.value, {
    tagName: 'mark',
    className: mergedClasses.value.highlightedText,
  });
};

defineExpose({
  inputRef,
  suggestionsList,
  isDropdownVisible,
  isFocused,
  update,
  clear,
  show,
  hide,
  blur: () => inputRef.value?.blur(),
  focus: () => inputRef.value?.focus(),
});
</script>

<template>
  <div :class="mergedClasses.container">
    <!-- Slot for the whole input wrapper -->
    <slot
      name="inputWrapper"
      v-bind="{ allInputProps, browserAutoProps, coreInputProps, mergedClasses }"
    >
      <!-- Input wrapper -->
      <div :class="mergedClasses.inputWrapper">
        <!-- Slot for the input only, preserve the wrapper -->
        <slot
          name="input"
          v-bind="{ allInputProps, browserAutoProps, coreInputProps, mergedClasses }"
        >
          <input ref="inputRef" v-bind="allInputProps" />
        </slot>

        <!-- Slot for loaders, custom clear buttons, etc -->
        <slot name="inputOverlay" v-bind="{ mergedClasses }"></slot>

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
      <!-- Hint. We render it unconditionally (with :empty hidden in CSS) to make customization via slots easier -->
      <div :class="mergedClasses.hint" @mousedown.prevent>
        <slot
          name="hint"
          v-bind="{
            suggestionsList,
            suggestionsHint: options.suggestionsHint,
            noSuggestionsHint: options.noSuggestionsHint,
            mergedClasses,
          }"
        >
          <!-- "Select an option or keep typing..." -->
          <template v-if="suggestionsList.length && options.suggestionsHint">
            {{ options.suggestionsHint }}
          </template>

          <!-- Nothing found -->
          <template
            v-else-if="
              !suggestionsList.length &&
              options.noSuggestionsHint &&
              options.noSuggestionsHint !== true
            "
          >
            {{ options.noSuggestionsHint }}
          </template>
        </slot>
      </div>

      <!-- All suggestions items / slot -->
      <slot
        name="suggestions"
        v-bind="{ suggestionsList, navigatedIndex, handleSuggestionClick, mergedClasses }"
      >
        <!-- TODO: Replace direct iteration on `suggestionsList` with dedicated `suggestionsUI` array -->

        <!-- Suggestion item -->
        <template v-for="(suggestion, index) in suggestionsList" :key="index">
          <!-- Slot for the whole suggestionItem element (you need to attach click handler by yourself) -->
          <slot
            name="suggestionItem"
            v-bind="{
              suggestion,
              index,
              isNavigated: index === navigatedIndex,
              handleSuggestionClick,
              mergedClasses,
            }"
          >
            <button
              :class="[
                mergedClasses.suggestionItem,
                index === navigatedIndex ? mergedClasses.navigatedSuggestionItem : '',
              ]"
              @mousedown.prevent="handleSuggestionClick(index)"
            >
              <!-- Slot only for contents (no need to handle clicks) -->
              <slot
                name="suggestionItemContent"
                v-bind="{
                  suggestion,
                  index,
                  isNavigated: index === navigatedIndex,
                  mergedClasses,
                }"
              >
                <!-- Slot for only title (value) of the suggestion -->
                <slot
                  name="suggestionItemTitle"
                  v-bind="{
                    suggestion,
                    index,
                    isNavigated: index === navigatedIndex,
                    mergedClasses,
                  }"
                >
                  <!-- Suggestion title (value) -->
                  <span
                    :class="[
                      mergedClasses.suggestionTitle,
                      ((suggestion as PartySuggestion | BankSuggestion).data.state?.status ===
                        'LIQUIDATED' ||
                        (suggestion as PartyBySuggestion | PartyKzSuggestion).data.status ===
                          'LIQUIDATED') &&
                        mergedClasses.strikethroughText,
                    ]"
                  >
                    <!-- title highlight chunks -->
                    <template
                      v-for="(chunk, key) in highlightChunks(suggestion.value, queryModel)"
                      :key="key"
                    >
                      <mark v-if="chunk.match" :class="mergedClasses.highlightedText">{{
                        chunk.text
                      }}</mark>

                      <template v-else>{{ chunk.text }}</template>
                    </template>
                  </span>
                </slot>

                <!-- Slot for only subtitle of the suggestion (for certain suggestions types) -->
                <slot
                  name="suggestionItemSubtitle"
                  v-bind="{
                    suggestion,
                    index,
                    isNavigated: index === navigatedIndex,
                    mergedClasses,
                  }"
                >
                  <!-- Suggestion subtitle. We render it unconditionally and hide :empty with CSS,
                   though TODO: after introducing `suggestionsUI`, we should change this. -->
                  <div
                    :class="mergedClasses.suggestionSubtitle"
                    v-html="prepareSubtitleHtml(suggestion)"
                  />
                </slot>
              </slot>
            </button>
          </slot>
        </template>
      </slot>
    </div>
  </div>
</template>

<style src="./vue-dadata.css"></style>
