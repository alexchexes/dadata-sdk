import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { KeyEvent } from '../types';
import type {
  BoundsType,
  LocationOptions,
  AddressSuggestion,
  AddressSuggestionsParams,
} from '../types';
import { getSuggestions } from '../api';

export function useSuggestions(
  props: {
    modelValue: string;
    suggestion?: AddressSuggestion | undefined;
    token: string;
    url?: string;
    disabled?: boolean;
    debounceWait?: number;
    toBound?: BoundsType;
    fromBound?: BoundsType;
    locationOptions?: LocationOptions;
    selectOnBlur: boolean;
    selectOnEnter: boolean;
    count: number;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (event: 'update:modelValue' | 'update:suggestion' | 'handleError', ...args: any[]) => void,
) {
  const queryProxy = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  const visibleQuery = ref('');

  const suggestionProxy = computed({
    get: () => props.suggestion,
    set: (value) => emit('update:suggestion', value),
  });

  const inputFocused = ref(false);
  const suggestionsVisible = ref(true);
  const activeIndex = ref(-1);
  const suggestionsList: Ref<AddressSuggestion[]> = ref([]);

  const fetchSuggestions = async (count?: number): Promise<AddressSuggestion[]> => {
    try {
      const params: AddressSuggestionsParams = {
        token: props.token,
        query: queryProxy.value,
        url: props.url,
        toBound: props.toBound,
        fromBound: props.fromBound,
        locationOptions: props.locationOptions,
        count: count ? count : props.count,
      };

      return getSuggestions(params);
    } catch (error) {
      emit('handleError', error);

      return new Promise<AddressSuggestion[]>((resolve) => {
        resolve([]);
      });
    }
  };

  const fetchWithDebounce = useDebounceFn(async () => {
    suggestionsList.value = await fetchSuggestions();
  }, props.debounceWait);

  const inputedQuery = ref('');

  watch(queryProxy, async (newVal) => {
    visibleQuery.value = queryProxy.value;

    activeIndex.value = -1;
    inputedQuery.value = newVal;

    fetchWithDebounce();
  });

  const hideDropdown = () => {
    if (props.disabled) {
      return;
    }

    suggestionsVisible.value = false;
    activeIndex.value = -1;
  };

  const selectSuggestion = (index: number) => {
    if (props.disabled) {
      return;
    }

    if (suggestionsList.value.length >= index - 1) {
      queryProxy.value = suggestionsList.value[index].value;
      suggestionProxy.value = suggestionsList.value[index];
    }
  };

  const onInputChange = (evt: Event) => {
    if (props.disabled) {
      return;
    }

    const target = evt.target as HTMLInputElement;
    queryProxy.value = target.value;

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
          hideDropdown();
        }
      }
    }

    if (keyEvent === KeyEvent.Esc) {
      suggestionsVisible.value = false;
      activeIndex.value = -1;
      visibleQuery.value = queryProxy.value;
    }

    if (keyEvent === KeyEvent.Up) {
      if (canGoUp.value && suggestionsVisible.value) {
        activeIndex.value -= 1;

        if (activeIndex.value > -1) {
          visibleQuery.value = suggestionsList.value[activeIndex.value].value;
        } else if (activeIndex.value === -1) {
          visibleQuery.value = queryProxy.value;
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

    if (props.selectOnBlur) {
      if (suggestionsList.value.length) {
        // @todo: we must use some matcher (like in official jquery plugin) instead always selecting first
        selectSuggestion(0);
      } else {
        suggestionProxy.value = undefined;
      }
    }

    visibleQuery.value = queryProxy.value;
    inputFocused.value = false;
  };

  const onSuggestionClick = (index: number) => {
    if (props.disabled) {
      return;
    }

    selectSuggestion(index);
    hideDropdown();
  };

  return {
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
  };
}
