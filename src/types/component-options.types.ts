import type { DEFAULT_CLASSES, SHOW_ON_FOCUS_OPTIONS } from '@/const';
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
  OptionalSuggestPayload,
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
} from './api';
import type { OneOrMany } from './helpers.types';
import type { InputHTMLAttributes } from 'vue';
import type { RawAxiosRequestHeaders } from 'axios';

export type ShowOnFocusOption = (typeof SHOW_ON_FOCUS_OPTIONS)[number];

/** @see DEFAULT_CLASSES */
export type VueDadataClasses = Partial<{ -readonly [K in keyof typeof DEFAULT_CLASSES]: string }>;

export interface VueDadataOptions {
  // ***************************
  // API Request Options
  // ***************************

  /**
   * Your DaData API token.
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
   * Maximum number of suggestion items to fetch from the DaData API.
   * Max: `20`, Default: `10`
   */
  count?: number;
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
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343795}
   *
   * Max: `10` items
   */
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
  /**
   * Limits the type of address object from which DaData begins searching:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house` | `flat`
   *
   * Corresponds to the `from_bound` API parameter.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
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
   * Restricts the search to specific locations (API `locations` parameter).
   * Max: `10` items
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
   * Used with `locationsFilter`. If `true`, the displayed suggestion (i.e., `value` field)
   * will exclude address parts up to the restricted level.
   *
   * For example, if the filter specifies a `region`, that region will be omitted in the result;
   * if it specifies a `city`, both the region and city will be omitted.
   *
   * Corresponds to the `restrict_value` API parameter.
   *
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
   * Organization type (for `party` and `bank` suggestions).
   * `LEGAL` or `INDIVIDUAL`
   * - {@link https://dadata.ru/api/suggest/party/}
   *
   * for BY and KZ see:
   * - {@link https://dadata.ru/api/suggest/party_by/}
   * - {@link https://dadata.ru/api/suggest/party_kz/}
   *
   * for 'bank' see:
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122}
   */
  entityType?: PartyType | OneOrMany<PartyByType> | OneOrMany<PartyKzType> | OneOrMany<BankType>;
  /**
   * Organization or bank status  (for `party` and `bank` suggestions)
   * - `'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | etc`
   * - *party*: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   * - *bank*: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120}
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
  /**
   * Custom payload for the API request.
   * Any fields specified here will be added to the final request payload, or override existing values if already set.
   */
  payload?: OptionalSuggestPayload;
  /**
   * Custom headers for the API request.
   * Any headers specified here will be added to the final request headers, or override existing values if already set.
   */
  headers?: RawAxiosRequestHeaders;

  // ***************************
  // Component Behavior Options
  // ***************************

  /**
   * If `false`, HTTP requests will not be cached.
   * Default `true`
   */
  httpCache?: boolean;
  /**
   * Delay (in ms) after the user changes the query before triggering a request.
   * Default `100`
   */
  debounceWait?: number;
  /**
   * Disables the input and all interactions.
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
   * Controls when to show the suggestions list on input focus.
   *
   * - `'no_selection'` (default): Suggestions appear when these conditions met:
   *   1. The user started typing and the suggestions list was loaded
   *   2. The user did not select any suggestion (or selected one and then changed the input)
   *   3. The input was unfocused (suggestions list was hidden)
   *   4. The input is focused again
   *
   * - `false`: Disables this behavior.
   *
   * - `'always'`: Always show suggestions on focus (if input and suggestions list is not empty).
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
   * If `true`, clears the suggestion (`v-model:suggestion`) when input is changed after suggestion selection.
   * Default: `true`
   */
  clearOnChange?: boolean;
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
   * Minimum length of text in the input after which suggestions are triggered.
   * Default `1`
   */
  minChars?: number;
  /**
   * Forces the suggestions list to always remain visible.
   * Useful during development (e.g., when styling elements).
   * Default: `false`
   */
  forceShow?: boolean;
}

type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type InternalVueDadataOptions = MakeRequired<
  VueDadataOptions,
  | 'inputName'
  | 'placeholder'
  | 'disabled'
  | 'selectOnBlur'
  | 'selectOnEnter'
  | 'enrichOnSelect'
  | 'showOnFocus'
  | 'clearOnChange'
  | 'addSpace'
  | 'continueSelecting'
  | 'showClearButton'
  | 'debounceWait'
  | 'suggestType'
  | 'language'
  | 'division'
  | 'count'
  | 'token'
  | 'httpCache'
  | 'restrictValue'
  | 'minChars'
  | 'forceShow'
>;
