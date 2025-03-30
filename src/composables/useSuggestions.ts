import { computed, ref, toValue, watch } from 'vue';
import { makeSuggestRequest } from '@/api';
import { DEFAULT_OPTIONS, HandledKeys } from '@/const';
import { reactiveComputed, useDebounceFn } from '@vueuse/core';
import type { AddressSuggestion } from '@/types/api';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type {
  SuggestOptions,
  MergedSuggestOptions,
  VueDadataOptions,
  InternalVueDadataOptions,
} from '@/types';
import type { VueDadataEmits } from '@/VueDadata.vue';
import { mergeDefined } from '@/utils';

export function useSuggestions(
  queryModel: Ref<string>,
  suggestionModel: Ref<AddressSuggestion | undefined>,
  userOptions: MaybeRefOrGetter<VueDadataOptions>,
  emit: VueDadataEmits,
) {
  const options = reactiveComputed(
    () => mergeDefined(DEFAULT_OPTIONS, toValue(userOptions)) as InternalVueDadataOptions,
  );

  const visibleQuery = ref('');
  const inputFocused = ref(false);
  const suggestionsVisible = ref(true);
  const navigatedIndex = ref(-1);
  const suggestionsList: Ref<AddressSuggestion[]> = ref([]);

  const requestOptions = computed(() => ({
    token: options.token,
    url: options.url,
    httpCache: options.httpCache,
    count: options.count,
    suggestType: options.suggestType,
    fromBound: options.fromBound,
    toBound: options.toBound,
    locationsFilter: options.locationsFilter,
    restrictValue: options.restrictValue,
    locationsBoost: options.locationsBoost,
    division: options.division,
    radiusFilter: options.radiusFilter,
    language: options.language,

    partyType: options.partyType,
    bankType: options.bankType,
    entityStatus: options.entityStatus,
    okved: options.okved,
    fioParts: options.fioParts,
    fioGender: options.fioGender,
  }));

  /**
   * Calls the API
   */
  const fetchSuggestions = async (
    optionsOverrides: Partial<SuggestOptions> = {},
  ): Promise<AddressSuggestion[]> => {
    try {
      const finalOptions: MergedSuggestOptions = {
        query: queryModel.value,
        ...requestOptions.value,
        ...optionsOverrides,
      };

      return await makeSuggestRequest(finalOptions as SuggestOptions);
    } catch (error) {
      emit('error', error);
      return [];
    }
  };

  const canClear = computed(() => queryModel.value !== '' && !options.disabled);

  const clear = () => {
    queryModel.value = '';
    suggestionModel.value = undefined;
    hideDropdown();
  };

  const fetchWithDebounce = useDebounceFn(async () => {
    suggestionsList.value = await fetchSuggestions();
  }, options.debounceWait);

  let dontFetchOnQueryChange = false;

  watch(requestOptions, async () => {
    if (!queryModel.value.length) {
      return;
    }

    await fetchWithDebounce();

    if (suggestionModel.value) {
      const enriched = await enrichSuggestion(suggestionModel.value);
      if (!enriched) {
        suggestionModel.value = undefined;
      }
    }
  });

  watch(queryModel, () => {
    visibleQuery.value = queryModel.value;
    navigatedIndex.value = -1;

    if (dontFetchOnQueryChange) {
      dontFetchOnQueryChange = false;
      return;
    }

    if (options.clearOnChange) {
      suggestionModel.value = undefined;
    }

    if (queryModel.value.length) {
      fetchWithDebounce();
    } else {
      suggestionsList.value = [];
      hideDropdown();
    }
  });

  const hideDropdown = () => {
    if (options.disabled) {
      return;
    }

    suggestionsVisible.value = false;
    navigatedIndex.value = -1;
  };

  const selectSuggestion = async (index: number) => {
    if (options.disabled) {
      return;
    }

    if (index < 0 || index >= suggestionsList.value.length) {
      // is this ever possible?
      return;
    }

    const selectedSuggestion = suggestionsList.value[index];

    suggestionModel.value = selectedSuggestion;

    if (!options.continueSelecting) {
      dontFetchOnQueryChange = true;
      hideDropdown();
    }

    if (options.addSpace) {
      queryModel.value = selectedSuggestion.value + ' ';
    } else {
      queryModel.value = selectedSuggestion.value;
    }

    if (options.enrichOnSelect) {
      enrichSuggestion(selectedSuggestion);
    }
  };

  const enrichSuggestion = async (selectedSuggestion: AddressSuggestion) => {
    const suggestions = await fetchSuggestions({
      query: selectedSuggestion.unrestricted_value,
      count: 1,
      restrictValue: false,
    });

    if (
      suggestions.length &&
      suggestions[0].unrestricted_value === selectedSuggestion.unrestricted_value
    ) {
      suggestionModel.value = suggestions[0];
      emit('enriched', suggestions[0]);
      return true;
    } else {
      emit('enrichFail', selectedSuggestion.unrestricted_value);
      return false;
    }
  };

  const handleInputChange = (evt: Event) => {
    if (options.disabled) {
      return;
    }

    const target = evt.target as HTMLInputElement;
    queryModel.value = target.value;

    suggestionsVisible.value = true;
  };

  const canGoDown = computed(() => navigatedIndex.value < suggestionsList.value.length - 1);
  const canGoUp = computed(() => navigatedIndex.value >= 0);
  const canSelectNavigatedIndex = computed(
    () => navigatedIndex.value >= 0 && navigatedIndex.value < suggestionsList.value.length,
  );

  const handleKeyPress = (event: KeyboardEvent) => {
    if (options.disabled) {
      return;
    }

    if (!Object.values(HandledKeys).includes(event.key as HandledKeys)) {
      return;
    }

    const key = event.key as HandledKeys;

    event.preventDefault();

    if (key === HandledKeys.Enter) {
      if (suggestionsVisible.value && suggestionsList.value.length) {
        let indexToSelect = null;

        if (canSelectNavigatedIndex.value) {
          indexToSelect = navigatedIndex.value;
        } else if (options.selectOnEnter) {
          indexToSelect = 0;
        }
        if (indexToSelect !== null) {
          selectSuggestion(indexToSelect);
        }
      }
    }

    if (key === HandledKeys.Esc) {
      suggestionsVisible.value = false;
      navigatedIndex.value = -1;
      visibleQuery.value = queryModel.value;
    }

    if (key === HandledKeys.Up) {
      if (canGoUp.value && suggestionsVisible.value) {
        navigatedIndex.value -= 1;

        if (navigatedIndex.value > -1) {
          visibleQuery.value = suggestionsList.value[navigatedIndex.value].value;
        } else if (navigatedIndex.value === -1) {
          visibleQuery.value = queryModel.value;
        }
      }
    }

    if (key === HandledKeys.Down) {
      if (suggestionsVisible.value) {
        if (canGoDown.value) {
          navigatedIndex.value += 1;
          visibleQuery.value = suggestionsList.value[navigatedIndex.value].value;
        }
      } else if (suggestionsList.value.length) {
        suggestionsVisible.value = true;
      }
    }
  };

  const handleInputFocus = (evt: FocusEvent) => {
    if (options.disabled) {
      return;
    }
    emit('focus', evt);
    inputFocused.value = true;

    if (options.showOnFocus !== false && suggestionsList.value.length) {
      if (
        options.showOnFocus === 'always' ||
        (options.showOnFocus === 'no_selection' && !suggestionModel.value)
      ) {
        suggestionsVisible.value = true;
      }
    }
  };

  const handleInputBlur = (evt: FocusEvent) => {
    if (options.disabled) {
      return;
    }
    emit('blur', evt);
    inputFocused.value = false;

    // suggestionsVisible check makes sense since we don't use matcher, but once added, we must
    // select match on blur in any case, not just when suggestionsVisible is true
    if (options.selectOnBlur && suggestionsVisible.value) {
      if (suggestionsList.value.length) {
        // @todo: we must use some matcher (like in official jquery plugin) instead always selecting first
        selectSuggestion(0);
      } else {
        suggestionModel.value = undefined;
      }
    }

    // Reset visible query in case it changed because user navigated suggestions with keyboard
    visibleQuery.value = queryModel.value;

    // respect the showOnFocus option
    if (options.showOnFocus === false) {
      suggestionsVisible.value = false;
    }
  };

  const handleSuggestionClick = (index: number) => {
    if (options.disabled) {
      return;
    }

    selectSuggestion(index);
  };

  return {
    visibleQuery,
    inputFocused,
    suggestionsVisible,
    navigatedIndex,
    suggestionsList,
    canClear,

    handleInputChange,
    handleKeyPress,
    handleInputFocus,
    handleInputBlur,
    handleSuggestionClick,
    clear,
  };
}
