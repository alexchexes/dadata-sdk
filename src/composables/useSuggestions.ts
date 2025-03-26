import { computed, ref, watch } from 'vue';
import { getSuggestions } from '@/api';
import { HandledKeys } from '@/const';
import { useDebounceFn } from '@vueuse/core';
import type { AddressSuggestion } from '@/types/api';
import type { Ref } from 'vue';
import type { SuggestAddressOptions, SuggestFiasOptions } from '@/types';
import type { VueDadataEmits, VueDadataProps } from '@/VueDadata.vue';

export function useSuggestions(
  queryModel: Ref<string>,
  suggestionModel: Ref<AddressSuggestion | undefined>,
  props: VueDadataProps,
  emit: VueDadataEmits,
) {
  const visibleQuery = ref('');
  const inputFocused = ref(false);
  const suggestionsVisible = ref(true);
  const navigatedIndex = ref(-1);
  const suggestionsList: Ref<AddressSuggestion[]> = ref([]);

  const fetchSuggestions = async (
    optionsOverrides: Partial<SuggestAddressOptions | SuggestFiasOptions> = {},
  ): Promise<AddressSuggestion[]> => {
    try {
      const baseOptions: SuggestAddressOptions | SuggestFiasOptions = {
        token: props.token,
        url: props.url,
        httpCache: props.httpCache,
        query: queryModel.value,
        count: props.count,
        suggestType: props.suggestType,
        fromBound: props.fromBound,
        toBound: props.toBound,
        locationsFilter: props.locationsFilter,
        restrictValue: props.restrictValue,
        locationsBoost: props.locationsBoost,
      };

      let finalOptions;

      switch (props.suggestType) {
        case 'address':
          finalOptions = {
            ...baseOptions,
            division: props.division,
            radiusFilter: props.radiusFilter,
            language: props.language,
          } as SuggestAddressOptions;
          break;
        case 'fias':
          finalOptions = baseOptions as SuggestFiasOptions;
          break;
        default:
          throw new Error(`Incorrect suggestType: ${props.suggestType}`);
      }

      if (Object.keys(optionsOverrides).length) {
        finalOptions = { ...finalOptions, ...optionsOverrides };
      }

      return await getSuggestions(finalOptions);
    } catch (error) {
      emit('error', error);
      return [];
    }
  };

  const canClear = computed(() => queryModel.value !== '' && !props.disabled);

  const clear = () => {
    queryModel.value = '';
    suggestionModel.value = undefined;
    hideDropdown();
  };

  const fetchWithDebounce = useDebounceFn(async () => {
    suggestionsList.value = await fetchSuggestions();
  }, props.debounceWait);

  let dontFetchOnQueryChange = false;

  watch(
    [
      () => props.count,
      () => props.division,
      () => props.fromBound,
      () => props.toBound,
      () => props.httpCache,
      () => props.language,
      () => props.locationsBoost,
      () => props.locationsFilter,
      () => props.radiusFilter,
      () => props.restrictValue,
      () => props.suggestType,
      () => props.token,
      () => props.url,
    ],
    async () => {
      await fetchWithDebounce();

      if (suggestionModel.value) {
        const enriched = await enrichSuggestion(suggestionModel.value);
        if (!enriched) {
          suggestionModel.value = undefined;
        }
      }
    },
  );

  watch(queryModel, () => {
    visibleQuery.value = queryModel.value;
    navigatedIndex.value = -1;

    if (dontFetchOnQueryChange) {
      dontFetchOnQueryChange = false;
      return;
    }

    if (props.clearSuggestionOnChange) {
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
    if (props.disabled) {
      return;
    }

    suggestionsVisible.value = false;
    navigatedIndex.value = -1;
  };

  const selectSuggestion = async (index: number) => {
    if (props.disabled) {
      return;
    }

    if (index < 0 || index >= suggestionsList.value.length) {
      // is this ever possible?
      return;
    }

    const selectedSuggestion = suggestionsList.value[index];

    suggestionModel.value = selectedSuggestion;

    if (!props.continueSelecting) {
      dontFetchOnQueryChange = true;
      hideDropdown();
    }

    if (props.addSpace) {
      queryModel.value = selectedSuggestion.value + ' ';
    } else {
      queryModel.value = selectedSuggestion.value;
    }

    if (props.enrichOnSelect) {
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

  const onInputChange = (evt: Event) => {
    if (props.disabled) {
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

  const onKeyPress = (event: KeyboardEvent) => {
    if (props.disabled) {
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
        } else if (props.selectOnEnter) {
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

  const onInputFocus = (evt: FocusEvent) => {
    if (props.disabled) {
      return;
    }
    emit('focus', evt);
    inputFocused.value = true;

    if (props.showOnFocus !== false && suggestionsList.value.length) {
      if (
        props.showOnFocus === 'always' ||
        (props.showOnFocus === 'no_selection' && !suggestionModel.value)
      ) {
        suggestionsVisible.value = true;
      }
    }
  };

  const onInputBlur = (evt: FocusEvent) => {
    if (props.disabled) {
      return;
    }
    emit('blur', evt);
    inputFocused.value = false;

    // suggestionsVisible check makes sense since we don't use matcher, but once added, we must
    // select match on blur in any case, not just when suggestionsVisible is true
    if (props.selectOnBlur && suggestionsVisible.value) {
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
    if (props.showOnFocus === false) {
      suggestionsVisible.value = false;
    }
  };

  const onSuggestionClick = (index: number) => {
    if (props.disabled) {
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

    onInputChange,
    onKeyPress,
    onInputFocus,
    onInputBlur,
    onSuggestionClick,
    clear,
  };
}
