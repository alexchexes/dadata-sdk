import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { KeyEvent } from '../types';
import type { AddressSuggestion, AddressSuggestionsParams } from '../types';
import type { VueDadataEmits, VueDadataProps } from '../VueDadata.vue';
import { getSuggestions } from '../api';

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

  const callSuggestionsApi = async (
    params: AddressSuggestionsParams,
  ): Promise<AddressSuggestion[]> => {
    try {
      return await getSuggestions(params);
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

  const fetchSuggestions = async (): Promise<AddressSuggestion[]> => {
    const params: AddressSuggestionsParams = {
      token: props.token,
      query: queryModel.value,
      url: props.url,
      toBound: props.toBound,
      fromBound: props.fromBound,
      locationOptions: props.locationOptions,
      language: props.language,
      locationsBoost: props.locationsBoost,
      count: props.count,
    };

    return callSuggestionsApi(params);
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

    if (queryModel.value.length) {
      fetchWithDebounce();
    } else {
      suggestionModel.value = undefined;
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
    const suggestions = await callSuggestionsApi({
      token: props.token,
      query: selectedSuggestion.unrestricted_value,
      count: 1,
    });

    if (suggestions.length) {
      suggestionModel.value = suggestions[0];
      emit('enriched', suggestions[0]);
    } else {
      suggestionModel.value = selectedSuggestion;
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
