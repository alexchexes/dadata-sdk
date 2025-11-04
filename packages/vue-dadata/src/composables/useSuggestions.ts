import { reactiveComputed, useDebounceFn } from '@vueuse/core';
import { computed, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

import type { VueDadataEmits } from '../VueDadata.vue';
import { ObsoleteResponseError } from '../api';
import { makeSuggestRequest } from '../api';
import { DEFAULT_OPTIONS, HandledKeys } from '../const';
import type { DadataSuggestion } from '../types';
import type {
  InternalVueDadataOptions,
  MergedSuggestOptions,
  SelectType,
  SuggestOptions,
  VueDadataOptions,
} from '../types';
import { deepDiff, mergeDefined } from '../utils';

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
   * TODO: We need to refactor this, as now re-compute this object each time when query changes,
   * because userOptions contains modelValue prop. This is not right.
   * (and we can't re-use list of those options in both `fetchSuggestions` and `watch(userRequestOptions)`,
   * or watcher will be triggered each time)
   */
  const options = reactiveComputed(
    () => mergeDefined(DEFAULT_OPTIONS, toValue(userOptions)) as InternalVueDadataOptions,
  );

  /** Reactive changes to these options will trigger re-fetching of suggestions */
  const optionsToWatch = computed(() => {
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
      branchType: o.branchType,
      okved: o.okved,
      fioParts: o.fioParts,
      fioGender: o.fioGender,
      filters: o.filters,
      payload: o.payload,
      minChars: o.minChars,
    };
  });
  const visibleQuery = ref('');
  const _isDropdownVisible = ref(false);
  const _isFocused = ref(false);
  const _shouldShowNoSuggestionsHint = ref(false);
  const navigatedIndex = ref(-1);
  const suggestionsList: Ref<DadataSuggestion[]> = ref([]);

  const isFocused = computed(() => _isFocused.value);
  const isDropdownVisible = computed(() => {
    if (options.forceHide || options.disabled) {
      return false;
    }
    if (options.forceShow) {
      return true;
    }
    if (
      options.noSuggestionsHint &&
      _shouldShowNoSuggestionsHint.value &&
      _isFocused.value &&
      minCharsReached.value
    ) {
      return true;
    }
    return Boolean(_isDropdownVisible.value && suggestionsList.value.length);
  });

  const minCharsReached = computed(() => queryModel.value.length >= options.minChars);
  const canGoDown = computed(() => navigatedIndex.value < suggestionsList.value.length - 1);
  const canGoUp = computed(() => navigatedIndex.value >= 0);
  const canSelectNavigatedIndex = computed(
    () => navigatedIndex.value >= 0 && navigatedIndex.value < suggestionsList.value.length,
  );
  const canClear = computed(() => queryModel.value !== '' && !options.disabled);

  // ===  Watchers guards ===
  let dontFetchOnQueryChange = false;
  let dontClearOnQueryChange = false;

  // ===============================
  // 🔍 Suggestion Fetching
  // ===============================

  /**
   * Merges options, calls the API and returns suggestions or empty array
   */
  const fetchSuggestions = async (
    optionsOverrides: Partial<SuggestOptions> = {},
  ): Promise<DadataSuggestion[]> => {
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
      branchType: options.branchType,
      okved: options.okved,
      fioParts: options.fioParts,
      fioGender: options.fioGender,
      filters: options.filters,
      payload: options.payload,
      headers: options.headers,
      ...optionsOverrides,
    };

    // skip request if the query is empty (because consumers may call `update()` when query is '')
    if (!finalOptions.query) {
      return [];
    }

    return await makeSuggestRequest(finalOptions as SuggestOptions);
  };

  /**
   * Calls `fetchSuggestions` which calls the API, and returns fetched suggestions
   * or `null` if any error cathed (where it also emits `error` if the error is not something expected).
   *
   * Expected errors include cases when request was cancelled and http-lib throwed `CanceledError`,
   * or the response to the request arrived AFTER a newer response to the request arrived.
   */
  const tryFetch = async (
    optionsOverrides: Partial<SuggestOptions> = {},
  ): Promise<DadataSuggestion[] | null> => {
    try {
      return await fetchSuggestions(optionsOverrides);
    } catch (error) {
      if (!(error instanceof ObsoleteResponseError)) {
        emit('error', error);
      }
      return null;
    }
  };

  const setSuggestionsIfNotEmpty = (suggestions: DadataSuggestion[] | null): void => {
    if (suggestions) {
      suggestionsList.value = suggestions;

      if (suggestions.length) {
        _shouldShowNoSuggestionsHint.value = false;
      } else {
        _shouldShowNoSuggestionsHint.value = true;
      }
    }
  };

  const tryUpdateList = async (optionsOverrides: Partial<SuggestOptions> = {}): Promise<void> => {
    const suggestions = await tryFetch(optionsOverrides);
    setSuggestionsIfNotEmpty(suggestions);
  };

  const update = async (
    optionsOverrides: Partial<SuggestOptions> = {},
  ): Promise<DadataSuggestion[]> => {
    const suggestions = await fetchSuggestions(optionsOverrides);
    setSuggestionsIfNotEmpty(suggestions);
    return suggestions;
  };

  const updateWithDebounce = useDebounceFn(
    () => tryUpdateList(),
    () => options.debounce,
  );

  const enrichSuggestion = async (selectedSuggestion: DadataSuggestion) => {
    const suggestions = await tryFetch({
      query: selectedSuggestion.unrestricted_value,
      count: 1,
      restrictValue: false,
    });

    if (
      suggestions?.length &&
      suggestions[0].unrestricted_value === selectedSuggestion.unrestricted_value
    ) {
      suggestionModel.value = suggestions[0];
      emit('enriched', suggestions[0], deepDiff(suggestionModel.value, suggestions[0]));
      return true;
    } else {
      emit('enrichFail', selectedSuggestion.unrestricted_value);
      return false;
    }
  };

  // ===============================
  // 👁 Watchers
  // ===============================

  watch(queryModel, (newVal, oldVal) => {
    visibleQuery.value = queryModel.value;
    navigatedIndex.value = -1;

    if (dontClearOnQueryChange) {
      // if clear-guard is active, disable it
      dontClearOnQueryChange = false;
    }
    // if there's no clear-guard - reset `suggestionModel` if conditions allow
    else if (
      options.clearOnChange === 'any' ||
      (options.clearOnChange === 'significant' &&
        newVal.trim().toLowerCase() !== oldVal.trim().toLowerCase())
    ) {
      suggestionModel.value = undefined;
    }

    if (dontFetchOnQueryChange) {
      dontFetchOnQueryChange = false;
      return;
    }

    if (minCharsReached.value) {
      updateWithDebounce();
    } else {
      suggestionsList.value = [];
      hide();
    }
  });

  // watch selected `suggestion` to be able update `query` when `suggestion` is set from outside
  // (using v-model:suggestion)
  watch(suggestionModel, () => {
    // if it's empty we do nothing - no need to reset `query` or `suggestionsList` in that case.
    // same when its `value` already matches current query.
    if (!suggestionModel.value?.value || queryModel.value === suggestionModel.value.value) {
      return;
    }

    // Set the query to `value` field of the new suggestion object
    // (with guards against fetching and `suggestionModel` reset when query changes)
    // and reset suggestions list so we never show user list that don't match current query
    dontFetchOnQueryChange = true;
    dontClearOnQueryChange = true;
    suggestionsList.value = [];
    queryModel.value = suggestionModel.value.value;
  });

  watch(optionsToWatch, () => {
    suggestionModel.value = undefined;

    if (queryModel.value.length < options.minChars) {
      return;
    }

    updateWithDebounce();
  });

  // ===============================
  // 🛠 Internal Utilities
  // ===============================

  const hide = () => {
    if (options.disabled) {
      return;
    }

    _isDropdownVisible.value = false;
    navigatedIndex.value = -1;
  };

  const selectSuggestion = async (index: number, selectType: SelectType) => {
    if (options.disabled) {
      return;
    }

    if (index < 0 || index >= suggestionsList.value.length) {
      // TODO: is this ever possible ↑ ?
      return;
    }

    const selectedSuggestion = suggestionsList.value[index];

    suggestionModel.value = selectedSuggestion;
    emit('select', selectedSuggestion, selectType);

    dontClearOnQueryChange = true;

    // The 'continueSelecting' option needs further refinement. Currently, it:
    // 1) Conflicts with 'enrichOnSelect'. Each request cancels the previous one, but when
    //    'continueSelecting' is enabled, two consecutive requests are made: one to enrich,
    //    and then another triggered by the updated queryModel. This second request cancels the first.
    //    (We can't use 'dontFetchOnQueryChange' in this case, since we still need to update the suggestions list.)
    // 2) The intended use case is to allow the user to select an address down to a specific level (e.g., house).
    //    Ideally, 'continueSelecting' should keep the dropdown open only until that level is selected.
    //    However, right now it's 'dumb' — the dropdown stays open forever, and developerse even
    //    have no way to disable it manually. This means the entire logic needs to be rethought and refactored.
    // POTENTIALLY: rename this prop with its current behavior to `hideOnSelect` and provide a method to re-fetch
    if (!options.continueSelecting) {
      dontFetchOnQueryChange = true;
      hide();
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

    if (!options.forceHide) {
      _isDropdownVisible.value = true;
    }
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
      if (_isDropdownVisible.value && suggestionsList.value.length) {
        if (canSelectNavigatedIndex.value) {
          selectSuggestion(navigatedIndex.value, 'enterNavigated');
        } else if (options.selectOnEnter) {
          selectSuggestion(0, 'enterFirst');
        }
      }
    }

    if (key === HandledKeys.Esc) {
      _isDropdownVisible.value = false;
      navigatedIndex.value = -1;
      visibleQuery.value = queryModel.value;
    }

    if (key === HandledKeys.Up) {
      if (canGoUp.value && _isDropdownVisible.value) {
        navigatedIndex.value -= 1;

        if (navigatedIndex.value > -1) {
          visibleQuery.value = suggestionsList.value[navigatedIndex.value].value;
        } else if (navigatedIndex.value === -1) {
          visibleQuery.value = queryModel.value;
        }
      }
    }

    if (key === HandledKeys.Down) {
      if (_isDropdownVisible.value) {
        if (canGoDown.value) {
          navigatedIndex.value += 1;
          visibleQuery.value = suggestionsList.value[navigatedIndex.value].value;
        }
      } else if (suggestionsList.value.length && !options.forceHide) {
        _isDropdownVisible.value = true;
      }
    }
  };

  const handleInputFocus = (evt: FocusEvent) => {
    _isFocused.value = true;

    if (options.disabled) {
      return;
    }
    emit('focus', evt);

    if (suggestionsList.value.length && options.showOnFocus !== false && !options.forceHide) {
      if (
        options.showOnFocus === 'always' ||
        (options.showOnFocus === 'no_selection' && !suggestionModel.value)
      ) {
        _isDropdownVisible.value = true;
      }
    }
  };

  const handleInputBlur = (evt: FocusEvent) => {
    _isFocused.value = false;

    if (options.disabled) {
      return;
    }
    emit('blur', evt);

    // isDropdownVisible check makes sense since we don't use matcher, but once added, we must
    // select match on blur in any case, not just when isDropdownVisible is true
    if (options.selectOnBlur && _isDropdownVisible.value) {
      if (suggestionsList.value.length) {
        // TODO: we must use some matcher (like in official jquery plugin) instead always selecting first
        selectSuggestion(0, 'blur');
      } else {
        suggestionModel.value = undefined;
      }
    }

    // Reset visible query in case it changed because user navigated suggestions with keyboard
    visibleQuery.value = queryModel.value;

    _isDropdownVisible.value = false;
  };

  /**
   * @param {number} index - Selected suggestion index
   *                         (obtained from `v-for="(suggestion, index) in suggestionsList"`)
   */
  const handleSuggestionClick = (index: number) => {
    if (options.disabled) {
      return;
    }

    selectSuggestion(index, 'click');
  };

  // ===============================
  //  📤 Public API
  // ===============================

  const clear = () => {
    queryModel.value = ''; // this also clears the `suggestionsList`
    suggestionModel.value = undefined;
    hide();
  };

  const show = () => {
    _isDropdownVisible.value = true;
  };

  return {
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
  };
}
