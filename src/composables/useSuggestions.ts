import { computed, ref, toValue, watch } from 'vue';
import { makeSuggestRequest } from '@/api';
import { DEFAULT_OPTIONS, HandledKeys } from '@/const';
import { reactiveComputed, useDebounceFn } from '@vueuse/core';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type {
  SuggestOptions,
  MergedSuggestOptions,
  VueDadataOptions,
  InternalVueDadataOptions,
} from '@/types';
import type { VueDadataEmits } from '@/VueDadata.vue';
import { mergeDefined } from '@/utils';
import { CanceledError } from 'axios';
import type { DadataSuggestion } from '@/types/api';

export function useSuggestions(
  queryModel: Ref<string>,
  suggestionModel: Ref<DadataSuggestion | undefined>,
  userOptions: MaybeRefOrGetter<VueDadataOptions>,
  emit: VueDadataEmits,
) {
  // ===============================
  // 📦 Reactive State & Computed
  // ===============================

  /**
   * @todo We need to refactor this, as now re-compute this object each time when query changes,
   * because userOptions contains modelValue prop. This is not right.
   * (and we can't re-use list of those options in both `fetchSuggestions` and `watch(userRequestOptions)`,
   * or watcher will be triggered each time)
   */
  const options = reactiveComputed(
    () => mergeDefined(DEFAULT_OPTIONS, toValue(userOptions)) as InternalVueDadataOptions,
  );

  /** Create a computed to watch options affecting API requests. */
  const userRequestOptions = computed(() => {
    const o = toValue(userOptions);
    return {
      token: o.token,
      url: o.url,
      httpCache: o.httpCache,
      count: o.count,
      suggestType: o.suggestType,
      fromBound: o.fromBound,
      toBound: o.toBound,
      locationsFilter: o.locationsFilter,
      restrictValue: o.restrictValue,
      locationsBoost: o.locationsBoost,
      division: o.division,
      radiusFilter: o.radiusFilter,
      language: o.language,
      entityType: o.entityType,
      entityStatus: o.entityStatus,
      okved: o.okved,
      fioParts: o.fioParts,
      fioGender: o.fioGender,
      filters: o.filters,
      payload: o.payload,
    };
  });
  const visibleQuery = ref('');
  const inputFocused = ref(false);
  const areSuggestionsVisible = ref(true);
  const navigatedIndex = ref(-1);
  const suggestionsList: Ref<DadataSuggestion[]> = ref([]);

  const canGoDown = computed(() => navigatedIndex.value < suggestionsList.value.length - 1);
  const canGoUp = computed(() => navigatedIndex.value >= 0);
  const canSelectNavigatedIndex = computed(
    () => navigatedIndex.value >= 0 && navigatedIndex.value < suggestionsList.value.length,
  );
  const canClear = computed(() => queryModel.value !== '' && !options.disabled);

  // ===  Watch guards ===
  let dontFetchOnQueryChange = false;

  // ===============================
  // 🔍 Suggestion Fetching
  // ===============================

  /**
   * Calls the API and returns fetched suggestions.
   * If request was cancelled (because of new request started faster than API responded), returns null.
   * In case of error also returns null and emits `error` event
   */
  const fetchSuggestions = async (
    optionsOverrides: Partial<SuggestOptions> = {},
  ): Promise<DadataSuggestion[] | null> => {
    try {
      const finalOptions: MergedSuggestOptions = {
        query: queryModel.value,
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
        entityType: options.entityType,
        entityStatus: options.entityStatus,
        okved: options.okved,
        fioParts: options.fioParts,
        fioGender: options.fioGender,
        filters: options.filters,
        payload: options.payload,
        headers: options.headers,
        ...optionsOverrides,
      };

      return await makeSuggestRequest(finalOptions as SuggestOptions);
    } catch (error) {
      if (!(error instanceof CanceledError)) {
        emit('error', error);
      }
      return null;
    }
  };

  const fetchWithDebounce = useDebounceFn(async () => {
    const fetched = await fetchSuggestions();
    if (fetched) {
      suggestionsList.value = fetched;
    }
  }, options.debounceWait);

  const enrichSuggestion = async (selectedSuggestion: DadataSuggestion) => {
    const suggestions = await fetchSuggestions({
      query: selectedSuggestion.unrestricted_value,
      count: 1,
      restrictValue: false,
    });

    if (
      suggestions?.length &&
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

  // ===============================
  // 👁 Watchers
  // ===============================

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

  watch(userRequestOptions, async () => {
    suggestionModel.value = undefined;

    if (!queryModel.value.length) {
      return;
    }

    await fetchWithDebounce();
  });

  // ===============================
  // 🛠 Internal Utilities
  // ===============================

  /** @internal */
  const hideDropdown = () => {
    if (options.disabled) {
      return;
    }

    areSuggestionsVisible.value = false;
    navigatedIndex.value = -1;
  };

  /** @internal */
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

    if (
      options.enrichOnSelect &&
      (options.suggestType === 'address' || options.suggestType === 'fias') &&
      (options.count !== 1 || options.restrictValue) // with count=1 it's already "enriched", until restrictValue is true
    ) {
      enrichSuggestion(selectedSuggestion);
    }
  };

  // ===============================
  // 🧠 Input Event Handlers
  // ===============================

  const handleInputChange = (evt: Event) => {
    if (options.disabled) {
      return;
    }

    const target = evt.target as HTMLInputElement;
    queryModel.value = target.value;

    areSuggestionsVisible.value = true;
  };

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
      if (areSuggestionsVisible.value && suggestionsList.value.length) {
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
      areSuggestionsVisible.value = false;
      navigatedIndex.value = -1;
      visibleQuery.value = queryModel.value;
    }

    if (key === HandledKeys.Up) {
      if (canGoUp.value && areSuggestionsVisible.value) {
        navigatedIndex.value -= 1;

        if (navigatedIndex.value > -1) {
          visibleQuery.value = suggestionsList.value[navigatedIndex.value].value;
        } else if (navigatedIndex.value === -1) {
          visibleQuery.value = queryModel.value;
        }
      }
    }

    if (key === HandledKeys.Down) {
      if (areSuggestionsVisible.value) {
        if (canGoDown.value) {
          navigatedIndex.value += 1;
          visibleQuery.value = suggestionsList.value[navigatedIndex.value].value;
        }
      } else if (suggestionsList.value.length) {
        areSuggestionsVisible.value = true;
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
        areSuggestionsVisible.value = true;
      }
    }
  };

  const handleInputBlur = (evt: FocusEvent) => {
    if (options.disabled) {
      return;
    }
    emit('blur', evt);
    inputFocused.value = false;

    // areSuggestionsVisible check makes sense since we don't use matcher, but once added, we must
    // select match on blur in any case, not just when areSuggestionsVisible is true
    if (options.selectOnBlur && areSuggestionsVisible.value) {
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
      areSuggestionsVisible.value = false;
    }
  };

  const handleSuggestionClick = (index: number) => {
    if (options.disabled) {
      return;
    }

    selectSuggestion(index);
  };

  // ===============================
  //  📤 Public API
  // ===============================

  const clear = () => {
    queryModel.value = '';
    suggestionModel.value = undefined;
    hideDropdown();
  };

  return {
    visibleQuery,
    inputFocused,
    areSuggestionsVisible,
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
