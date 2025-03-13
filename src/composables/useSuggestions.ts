import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { KeyEvent } from '../types';
import type { BoundsType, LocationOptions, Suggestion, SuggestionDto } from '../types';
import { getSuggestions } from '../api';

export function useSuggestions(
  props: {
    modelValue: string;
    suggestion?: Suggestion | undefined;
    token: string;
    url?: string;
    disabled?: boolean;
    debounceWait?: number;
    toBound?: BoundsType;
    fromBound?: BoundsType;
    locationOptions?: LocationOptions;
    selectOnBlur: boolean;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (event: 'update:modelValue' | 'update:suggestion' | 'handleError', ...args: any[]) => void,
) {
  const queryProxy = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  const suggestionProxy = computed({
    get: () => props.suggestion,
    set: (value) => emit('update:suggestion', value),
  });

  const inputFocused = ref(false);
  const suggestionsVisible = ref(true);
  const activeIndex = ref(-1);
  const suggestionsList: Ref<Suggestion[]> = ref([]);

  const fetchSuggestions = async (count?: number): Promise<Suggestion[]> => {
    try {
      const request: SuggestionDto = {
        token: props.token,
        query: queryProxy.value,
        url: props.url,
        toBound: props.toBound,
        fromBound: props.fromBound,
        locationOptions: props.locationOptions,
        count,
      };

      return getSuggestions(request);
    } catch (error) {
      emit('handleError', error);

      return new Promise<Suggestion[]>((resolve) => {
        resolve([]);
      });
    }
  };

  const fetchWithDebounce = useDebounceFn(async () => {
    suggestionsList.value = await fetchSuggestions();
  }, props.debounceWait);

  watch(queryProxy, async () => {
    fetchWithDebounce();
  });

  const resetDropdown = () => {
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

  const onInputChange = () => {
    if (props.disabled) {
      return;
    }

    suggestionsVisible.value = true;
  };

  const canGoDown = computed(() => activeIndex.value < suggestionsList.value.length - 1);
  const canGoUp = computed(() => activeIndex.value >= 0);
  const canSelect = computed(() => canGoUp.value && canGoDown.value);

  const onKeyPress = (keyboardEvent: KeyboardEvent, keyEvent: KeyEvent) => {
    if (props.disabled) {
      return;
    }

    keyboardEvent.preventDefault();

    if (keyEvent === KeyEvent.Enter) {
      if (canSelect.value) {
        selectSuggestion(activeIndex.value);
        resetDropdown();
      }
    }

    if (keyEvent === KeyEvent.Esc) {
      suggestionsVisible.value = false;
    }

    if (keyEvent === KeyEvent.Up) {
      if (canGoUp.value) {
        activeIndex.value -= 1;
      }
    }

    if (keyEvent === KeyEvent.Down) {
      if (canGoDown.value) {
        activeIndex.value += 1;
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

    inputFocused.value = false;
  };

  const onSuggestionClick = (index: number) => {
    if (props.disabled) {
      return;
    }

    selectSuggestion(index);
    resetDropdown();
  };

  return {
    queryProxy,
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
