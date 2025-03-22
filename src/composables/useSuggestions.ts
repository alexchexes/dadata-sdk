import { computed, ref, watch } from 'vue';
import { getSuggestions } from '@/api';
import { KeyEvent } from '@/const';
import { useDebounceFn } from '@vueuse/core';
import type { AddressSuggestion } from '@/types/api';
import type { Ref } from 'vue';
import type { SuggestAddressOptions } from '@/types';
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
  const activeIndex = ref(-1);
  const suggestionsList: Ref<AddressSuggestion[]> = ref([]);

  const fetchSuggestions = async (
    paramsOverrides: Partial<SuggestAddressOptions> = {},
  ): Promise<AddressSuggestion[]> => {
    try {
      return await getSuggestions({
        token: props.token,
        url: props.url,
        httpCache: props.httpCache,
        query: queryModel.value,
        count: props.count,
        division: props.division,
        fromBound: props.fromBound,
        toBound: props.toBound,
        locationsFilter: props.locationsFilter,
        radiusFilter: props.radiusFilter,
        restrictValue: props.restrictValue,
        locationsBoost: props.locationsBoost,
        language: props.language,
        ...paramsOverrides,
      });
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

  watch(queryModel, () => {
    visibleQuery.value = queryModel.value;
    activeIndex.value = -1;

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
    activeIndex.value = -1;
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
    } else {
      console.warn(`Vue-Dadata: Can't enrich suggestion: ${selectedSuggestion.unrestricted_value}`);
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

  const canGoDown = computed(() => activeIndex.value < suggestionsList.value.length - 1);
  const canGoUp = computed(() => activeIndex.value >= 0);
  const haveActiveToSelect = computed(() => canGoUp.value && canGoDown.value);

  const onKeyPress = (keyboardEvent: KeyboardEvent, keyEvent: KeyEvent) => {
    if (props.disabled) {
      return;
    }

    keyboardEvent.preventDefault();

    if (keyEvent === KeyEvent.Enter) {
      if (suggestionsVisible.value && suggestionsList.value.length) {
        let indexToSelect = null;
        if (haveActiveToSelect.value) {
          indexToSelect = activeIndex.value;
        } else if (props.selectOnEnter) {
          indexToSelect = 0;
        }
        if (indexToSelect !== null) {
          selectSuggestion(indexToSelect);
        }
      }
    }

    if (keyEvent === KeyEvent.Esc) {
      suggestionsVisible.value = false;
      activeIndex.value = -1;
      visibleQuery.value = queryModel.value;
    }

    if (keyEvent === KeyEvent.Up) {
      if (canGoUp.value && suggestionsVisible.value) {
        activeIndex.value -= 1;

        if (activeIndex.value > -1) {
          visibleQuery.value = suggestionsList.value[activeIndex.value].value;
        } else if (activeIndex.value === -1) {
          visibleQuery.value = queryModel.value;
        }
      }
    }

    if (keyEvent === KeyEvent.Down) {
      if (suggestionsVisible.value) {
        if (canGoDown.value) {
          activeIndex.value += 1;
          visibleQuery.value = suggestionsList.value[activeIndex.value].value;
        }
      } else if (suggestionsList.value.length) {
        suggestionsVisible.value = true;
      }
    }
  };

  const onInputFocus = () => {
    if (props.disabled) {
      return;
    }

    inputFocused.value = true;
  };

  const onInputBlur = () => {
    if (props.disabled) {
      return;
    }

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

    visibleQuery.value = queryModel.value;
    inputFocused.value = false;
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
    activeIndex,
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
