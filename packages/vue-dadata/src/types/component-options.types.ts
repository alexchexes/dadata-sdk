import type { CLEAR_ON_CHANGE_OPTIONS, DEFAULT_CLASSES, SHOW_ON_FOCUS_OPTIONS } from '../const';
import type {
  BankStatus,
  BankType,
  BoundType,
  DivisionType,
  FioGenders,
  FioParts,
  KladrIdFilter,
  Language,
  LocationRestriction,
  PartyByStatus,
  PartyByType,
  PartyKzType,
  PartyStatus,
  PartyType,
  RadiusFilter,
  SuggestFmsUnitFilter,
  SuggestFnsUnitFilter,
  SuggestMetroFilter,
  SuggestMktuFilter,
  SuggestOkpd2Filter,
  SuggestOkved2Filter,
  SuggestPartyByFilter,
  SuggestPartyKzFilter,
  SuggestPostalUnitFilter,
  SuggestRegionCourtFilter,
  SuggestType,
  OneOrMany,
} from '@dadata-sdk/api-types';

import type { InputHTMLAttributes } from 'vue';
import type { OptionalSuggestPayload } from './suggest-options.types';

export type ShowOnFocusOption = (typeof SHOW_ON_FOCUS_OPTIONS)[number];
export type ClearOnChangeOption = (typeof CLEAR_ON_CHANGE_OPTIONS)[number];

/** @see DEFAULT_CLASSES */
export type VueDadataClasses = Partial<{ -readonly [K in keyof typeof DEFAULT_CLASSES]: string }>;

export interface VueDadataOptions {
  // ***************************
  // General options
  // ***************************

  /**
   * Your DaData API key (token).
   */
  token: string;
  /**
   * Type of suggestions (Dadata suggest API endpoint):
   * - `address` - Normal addresses {@link https://dadata.ru/api/suggest/address/}
   * - `fias` - FIAS addresses (discouraged by Dadata) {@link https://dadata.ru/api/suggest/fias/}
   * - `party` - Legal entities {@link https://dadata.ru/api/suggest/party/}
   * - `bank` - Finance organizations {@link https://dadata.ru/api/suggest/bank/}
   * - `fio` - Names, surnames, patronymics {@link https://dadata.ru/api/suggest/name/}
   * - `email` - Email address {@link https://dadata.ru/api/suggest/email/}
   *
   * Default `address`
   */
  suggestType?: SuggestType;
  /**
   * Custom API URL.
   * Useful when proxying requests to the DaData API.
   *
   * Note: the endpoint (i.e. `suggestType`) is not appended automatically.
   * You must provide the full URL, e.g. `https://example.com/suggest_api/address`.
   *
   * Default: The final URL is built from the base DaData suggest API (`.../api/4_1/rs/suggest/`) + `suggestType`.
   */
  url?: string;
  /**
   * If `false`, HTTP requests will not be cached.
   * Default `true`
   */
  httpCache?: boolean;
  /**
   * Custom payload for the API request.
   * Any fields specified here will be added to the final request payload, or override existing values if already set.
   */
  payload?: OptionalSuggestPayload;
  /**
   * Custom headers for the API request.
   * Any headers specified here will be added to the final request headers, or override existing values if already set.
   */
  headers?: Record<string, string>;

  // ***************************
  // API request options
  // ***************************

  /**
   * Maximum number of suggestion items to fetch from the DaData API.
   * Max: `20`, Default: `10`
   */
  count?: number;
  /**
   * `kladr_id` or an array of `kladr_id`s for the region/city to be prioritized in suggestions.
   * Corresponds to the `locations_boost` API parameter.
   *
   * Examples:
   * - `55` — Omsk region
   * - `63000001` — Samara city
   * - `6300000100000` — Samara city (full KLADR code)
   * - `[50, 77]` — Moscow and Moscow-City regions
   * - `{kladr_id: '02'}` or `[{kladr_id: '02'}, ...]` — native DaData API format
   *
   * - 'address': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343795}
   * - 'fias': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425529}
   *
   * Max: `10` items
   */
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
  /**
   * Restricts the search to specific locations (API `locations` parameter).
   * Max: `10` items
   *
   * For example (when `suggestType=address`), to search only in Voronezh city and in Rostov region:
   * `:locationsFilter="[{'region':'Воронежская','city':'Воронеж'},{'region':'Ростовская'}]"`
   *
   * - For `address`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108}
   * - For `fias`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974}
   *
   * For `party` and `bank`, the only supported filter is `kladr_id`.
   * - For `party`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669123}
   * - For `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106238}
   */
  locationsFilter?: OneOrMany<LocationRestriction | string | number>;
  /**
   * Limits the type of address object from which DaData begins searching:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house` | `flat`
   *
   * Corresponds to the `from_bound` API parameter.
   *
   * - For 'address': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   *
   * - 'fias': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   */
  fromBound?: BoundType;
  /**
   * Limits the type of address object to which DaData performs the search:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house` | `flat`
   *
   * Corresponds to the `to_bound` API parameter.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   */
  toBound?: BoundType;
  /**
   * Used with `locationsFilter`. If `true`, the displayed suggestion (i.e., `value` field)
   * will exclude address parts up to the restricted level.
   *
   * For example, if the filter specifies a `region`, that region will be omitted in the result;
   * if it specifies a `city`, both the region and city will be omitted.
   *
   * Corresponds to the `restrict_value` API parameter.
   *
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737934#id-Ограничениепоназваниюадресногообъекта-Адресбезрегионаигорода}
   * - {@link https://confluence.hflabs.ru/display/SGTDOC/address.value#address.value-Параметрrestrict_value}
   */
  restrictValue?: boolean;
  /**
   * Restrict the search to a specific radius around a latitude/longitude point.
   * Corresponds to the `locations_geo` API parameter.
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806
   */
  radiusFilter?: RadiusFilter;
  /**
   * Type of territorial division: `ADMINISTRATIVE` or `MUNICIPAL`. Affects set of fields inside `suggestion.data`
   * Default: `ADMINISTRATIVE`.
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   */
  division?: DivisionType;
  /**
   * Display language for address suggestions.
   * `RU` or `EN`. The `EN` version mostly provides transliteration.
   *
   * Default: `RU`.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=976388726}
   */
  language?: Language;
  /**
   * Organization or bank type (for `party`, `party_by`, `party_kz`, and `bank` suggestions).
   *
   * for `party`: `LEGAL` or `INDIVIDUAL`, {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176337}
   * - for `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122}
   *
   * - for `party_by`: {@link https://dadata.ru/api/suggest/party_by/}
   * - for `party_kz`: {@link https://dadata.ru/api/suggest/party_kz/}
   */
  entityType?: PartyType | OneOrMany<PartyByType> | OneOrMany<PartyKzType> | OneOrMany<BankType>;
  /**
   * Organization or bank status  (for `party`, `party_by` and `bank` suggestions)
   * - `'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | etc`
   * - `party`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   * - `party_by`: {@link https://dadata.ru/api/suggest/party_by/}
   * - `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120}
   */
  entityStatus?: OneOrMany<PartyStatus> | OneOrMany<PartyByStatus> | OneOrMany<BankStatus>;
  /**
   * OKVED code filter (for `party` suggestions). Max: `10` items
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1093075333}
   */
  okved?: OneOrMany<string>;
  /**
   * Filter by FIO parts (for `fio` suggestions, see {@link https://dadata.ru/api/suggest/name/}).
   *
   * Examples:
   * - Names only: `['NAME']` or `NAME`
   * - Names and patronymics: `['NAME', 'PATRONYMIC']`
   * - Names and surnames: `['NAME', 'SURNAME']`
   */
  fioParts?: OneOrMany<FioParts>;
  /**
   * Filter by gender (for `fio` suggestions).
   * - `UNKNOWN` / `MALE` / `FEMALE`
   */
  fioGender?: FioGenders;
  /**
   * Filters for APIs that don't have dedicated options props,
   * like `fms_unit`, `fns_unit`, `metro`, `mktu`, `okpd2`, `okved2`, `postal_unit`, `region_court`.
   *
   * To set `filters` for `party_by` and `party_kz` use `entityStatus` and `entityType` options, just like for normal `party`.
   */
  filters?: OneOrMany<
    | SuggestFmsUnitFilter
    | SuggestFnsUnitFilter
    | SuggestMetroFilter
    | SuggestMktuFilter
    | SuggestOkpd2Filter
    | SuggestOkved2Filter
    | SuggestPartyByFilter
    | SuggestPartyKzFilter
    | SuggestPostalUnitFilter
    | SuggestRegionCourtFilter
  >;

  // ***************************
  // Component features options
  // ***************************

  /**
   * Delay (in ms) after the user changes the query before triggering a request.
   * Default `100`
   */
  debounce?: number;
  /**
   * Minimum length of text in the input after which suggestions are triggered.
   * Default `1`
   */
  minChars?: number;
  /**
   * Disables the input, suggestions, and all interactions.
   * Default `false`
   */
  disabled?: boolean;
  /**
   * Text used for the input's `placeholder` attribute.
   */
  placeholder?: string;
  /**
   * Value for the input's `name` attribute.
   * Default `vue-dadata-input`
   */
  inputName?: string;
  /**
   * Custom CSS classes names for component elements.
   * Defaults: @see DEFAULT_CLASSES
   */
  classes?: VueDadataClasses;
  /**
   * Additional attributes to pass to the internal `<input>` element.
   *
   * Useful for controlling browser behavior (`autocomplete`, `autocapitalize`, `inputmode`,
   * `enterkeyhint`, etc.)
   *
   * Note:
   * - Critical attributes and event handlers (`value`, `onInput`, `onBlur`, etc.) are managed
   *   internally and cannot be overridden.
   * - The `disabled` state must be controlled via the `disabled` prop on `VueDadata`,
   *   not through `inputAttributes`.
   * - To listen for `onFocus`/`onBlur`, use `@focus`/`@blur` on the `VueDadata` component.
   *
   * **Example:**
   * ```vue
   * <VueDadata :input-attributes="{ autocomplete: 'one-time-code', inputmode: 'numeric' }" />
   * ```
   */
  inputAttributes?: Omit<
    InputHTMLAttributes,
    'disabled' | 'value' | 'onBlur' | 'onFocus' | 'onInput' | 'onKeydown' | 'onChange'
  >;
  /**
   * Controls when to show the dropdown with suggestions list on input focus.
   *
   * - `false`: Never show dropdown on focus
   * - `'always'`: Always show dropdown on focus (if input and suggestions list is not empty).
   * - `'no_selection'`: Show dropdown on focus when there's no selected suggestion
   *
   * Default: `'no_selection'`
   */
  showOnFocus?: ShowOnFocusOption;
  /**
   * If `true`, the first suggestion will be auto-selected after input lost focus.
   * Default: `false`
   */
  selectOnBlur?: boolean;
  /**
   * If `true`, pressing Enter selects the first suggestion (if list is open).
   * Default: `true`
   */
  selectOnEnter?: boolean;
  /**
   * Whether to send an additional request after a suggestion is selected to enrich it with
   * data like `geo_lat`, `geo_lon`, `city_district` (and full `value` when `restrictValue` is used).
   *
   * Set to `false` if you want to save API usage and don’t need that data.
   * Default: `true`
   */
  enrichOnSelect?: boolean;
  /**
   * Determines whether the suggestion (i.e., `v-model:suggestion`) is cleared when the input changes after a suggestion is selected.
   *
   * - `false`: The suggestion is never cleared when the input changes.
   * - `'any'`: The suggestion is cleared whenever input value is changed.
   * - `'significant'`: The suggestion is cleared only if the new input, after being normalized (e.g., trimmed and case-normalized), differs from the previous value.
   *
   * Default: `'significant'`
   */
  clearOnChange?: ClearOnChangeOption;
  /**
   * If `true`, adds a space to the input after a suggestion is selected. This way, for example,
   * user can select street and then type house number without adding a space by himself.
   * Default `true`
   */
  addSpace?: boolean;
  /**
   * If `true`, the suggestions list will remain visible after selecting a suggestion.
   * Default: `false`
   */
  continueSelecting?: boolean;
  /**
   * If `true`, shows a clear (×) button in the input when not empty.
   * Default: `false`
   */
  showClearButton?: boolean;
  /**
   * Text to show above the suggestions list
   */
  suggestionsHint?: string | false;
  /**
   * Text to show in place of suggestions when there's no suggestions
   */
  noSuggestionsHint?: string | false;
  /**
   * If `true`, input will be focused immediately when the component is mounted.
   * Default `false`
   */
  focusOnMounted?: boolean;
  /**
   * Forces the suggestions list to always remain visible.
   * Useful during development (e.g., when styling elements).
   * Default: `false`
   */
  forceShow?: boolean;
  /**
   * Forces the suggestions list to always remain hidden.
   * Useful when creating custom UI using `v-model:suggestionsList`
   * Default: `false`
   */
  forceHide?: boolean;
}

type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type InternalVueDadataOptions = MakeRequired<
  VueDadataOptions,
  | 'inputName'
  | 'placeholder'
  | 'selectOnEnter'
  | 'enrichOnSelect'
  | 'showOnFocus'
  | 'clearOnChange'
  | 'debounce'
  | 'suggestType'
  | 'language'
  | 'division'
  | 'count'
  | 'token'
  | 'httpCache'
  | 'minChars'
>;

export type SelectType = 'click' | 'blur' | 'enterNavigated' | 'enterFirst';
