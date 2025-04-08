<script lang="ts" setup>
import {
  computed,
  onMounted,
  useTemplateRef,
  watchEffect,
  type InputHTMLAttributes,
  type PropType,
} from 'vue';
import { DEFAULT_CLASSES, DEFAULT_OPTIONS } from '@/const';
import { highlightHtml } from '@/utils';
import { matchWords, mergeDefined } from '@/utils';
import { useSuggestions } from '@/composables/useSuggestions';
import IconCross from '@/IconCross.vue';
import type { VueDadataClasses, VueDadataOptions } from '@/types';
import type {
  BankSuggestion,
  DadataSuggestion,
  PartyBySuggestion,
  PartyKzSuggestion,
  PartySuggestion,
} from '@/types/api';

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

const suggestionsListModel = defineModel('suggestionsList', {
  type: Array as PropType<DadataSuggestion[] | undefined>,
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
  clear,
  show,
  hide,
} = useSuggestions(queryModel, suggestionModel, props, emit);

watchEffect(() => {
  suggestionsListModel.value = suggestionsList.value;
});

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

const suggestionsHintShown = computed(
  () => suggestionsList.value.length && options.suggestionsHint,
);
const noSuggestionsHintShown = computed(
  () => !suggestionsList.value.length && options.noSuggestionsHint,
);

const hintShown = computed(() => suggestionsHintShown.value || noSuggestionsHintShown.value);

const prepareSubtitleHtml = (suggestion: DadataSuggestion): string => {
  let subtitle = '';

  // // @todo For `address` we need to show history_values
  // // only if query part doesn't match `value` but matches one of `history_values`.
  // // If we show in all cases when history_values is present, we have odd notes like
  // // like "бывш. Ленинград" for "г Санкт-Петербург"
  // if (options.suggestType === 'address') {
  //   const addrSuggestion = suggestion as BaseAddressSuggestion;
  //   if (addrSuggestion.data.history_values?.length) {
  //     subtitle = 'бывш. ' + addrSuggestion.data.history_values?.join(', ');
  //   }
  // }

  // @todo For `party` we need to show additional info based on what was is matches to the query.
  // Default should be `inn` but if 'party' was found by ogrn, then show ogrn, etc
  if (options.suggestType === 'party') {
    const partySuggestion = suggestion as PartySuggestion;
    subtitle = `${partySuggestion.data.inn} ${partySuggestion.data.address?.value}`;
  }

  // @todo For `party` we need to show additional info based on what was is matches to the query.
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
  isDropdownVisible,
  isFocused,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear,
  show,
  hide,
});
</script>

<template>
  <div :class="mergedClasses.container">
    <!-- Slot for the whole input wrapper. User can pass his custom input here -->
    <slot name="inputWrapper" :allInputProps :browserAutoProps :coreInputProps>
      <!-- Input wrapper -->
      <div :class="mergedClasses.inputWrapper">
        <!-- Slot for the input only, preserve the wrapper. User can pass his custom input here as well -->
        <slot name="input" :allInputProps :browserAutoProps :coreInputProps>
          <input ref="inputRef" v-bind="allInputProps" />
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
          <!-- Slot for the whole suggestionItem element (you need to attach click handler by yourself) -->
          <slot
            name="suggestionItem"
            :handleSuggestionClick
            :index
            :isNavigated="index === navigatedIndex"
            :suggestion
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
                :isNavigated="index === navigatedIndex"
                :suggestion
              >
                <!-- Slot for only title (value) of the suggestion -->
                <slot
                  name="suggestionItemTitle"
                  :isNavigated="index === navigatedIndex"
                  :suggestion
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
                      v-for="(chunk, key) in matchWords(suggestion.value, queryModel)"
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
                  :isNavigated="index === navigatedIndex"
                  :suggestion
                >
                  <!-- Suggestion subtitle -->
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
