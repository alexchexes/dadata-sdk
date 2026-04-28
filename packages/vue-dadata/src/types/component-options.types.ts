import type {
  BankStatus,
  BankType,
  BoundType,
  BranchType,
  DivisionType,
  FioGenders,
  FioParts,
  KladrIdFilter,
  Language,
  LocationRestriction,
  OneOrMany,
  PartyByStatus,
  PartyByType,
  PartyKzType,
  PartyStatus,
  PartyType,
  RadiusFilter,
  SuggestCourtFilter,
  SuggestFmsUnitFilter,
  SuggestFnsUnitFilter,
  SuggestMetroFilter,
  SuggestMktuFilter,
  SuggestOkpd2Filter,
  SuggestOkved2Filter,
  SuggestPartyByFilter,
  SuggestPartyKzFilter,
  SuggestPostalUnitFilter,
  SuggestType,
} from '@dadata-sdk/api-types';
import type { InputHTMLAttributes } from 'vue';

import type { CLEAR_ON_CHANGE_OPTIONS, DEFAULT_CLASSES, SHOW_ON_FOCUS_OPTIONS } from '../const';
import type { OptionalSuggestPayload } from './suggest-options.types';

export type ShowOnFocusOption = (typeof SHOW_ON_FOCUS_OPTIONS)[number];
export type ClearOnChangeOption = (typeof CLEAR_ON_CHANGE_OPTIONS)[number];

/** @see DEFAULT_CLASSES */
export type VueDadataClasses = Partial<{ -readonly [K in keyof typeof DEFAULT_CLASSES]: string }>;

export type PlainHeaders = Record<string, string | number | boolean | null | undefined>;

export interface VueDadataOptions {
  // ***************************
  // General options
  // ***************************

  /**
   * Ваш API-ключ (token) DaData.
   *
   * @locale EN
   * Your DaData API key (token).
   */
  token: string;
  /**
   * Тип подсказок, то есть используемый эндпоинт suggest API DaData:
   * - `address` - обычные адреса {@link https://dadata.ru/api/suggest/address/}
   * - `fias` - адреса строго по ФИАС (не рекомендовано) {@link https://dadata.ru/api/suggest/fias/}
   * - `party` - организации {@link https://dadata.ru/api/suggest/party/}
   * - `bank` - банки {@link https://dadata.ru/api/suggest/bank/}
   * - `fio` - имена, фамилии, отчества {@link https://dadata.ru/api/suggest/name/}
   * - `email` - email-адреса {@link https://dadata.ru/api/suggest/email/}
   *
   * По умолчанию `address`
   *
   * @locale EN
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
   * Пользовательский URL API.
   * Полезно, если вы проксируете запросы к DaData.
   *
   * Важно: эндпоинт (то есть `suggestType`) в настоящий момент не добавляется автоматически.
   * Нужно передать полный URL вашего эндпоинта, например `https://my-api-proxy.example.com/suggest/address`.
   *
   * Если не передано, итоговый URL собирается из базового suggest API DaData (`.../api/4_1/rs/suggest/`) + `suggestType`.
   *
   * @locale EN
   * Custom API URL.
   * Useful when proxying requests to the DaData API.
   *
   * Note: currently the endpoint (i.e. `suggestType`) is not appended automatically.
   * You must provide the full URL, e.g. `https://my-api-proxy.example.com/suggest/address`.
   *
   * Default: The final URL is built from the base DaData suggest API (`.../api/4_1/rs/suggest/`) + `suggestType`.
   */
  url?: string;
  /**
   * Если `false`, HTTP-запросы не будут кэшироваться.
   * По умолчанию `true`
   *
   * @locale EN
   * If `false`, HTTP requests will not be cached.
   * Default `true`
   */
  httpCache?: boolean;
  /**
   * Пользовательский payload для API-запроса.
   * Поля, указанные здесь, будут добавлены в итоговый payload, переопределяя существующие значения.
   *
   * @locale EN
   * Custom payload for the API request.
   * Any fields specified here will be added to the final request payload, or override existing values if already set.
   */
  payload?: OptionalSuggestPayload;
  /**
   * Пользовательские HTTP-заголовки для API-запроса.
   * Заголовки, указанные здесь, будут добавлены в итоговые headers переопределяя существующие значения.
   *
   * @locale EN
   * Custom headers for the API request.
   * Any headers specified here will be added to the final request headers, or override existing values if already set.
   */
  headers?: PlainHeaders;

  // ***************************
  // API request options
  // ***************************

  /**
   * Максимальное количество подсказок, запрашиваемых у API DaData.
   * Макс: `20`, по умолчанию: `10`
   *
   * @locale EN
   * Maximum number of suggestion items to fetch from the DaData API.
   * Max: `20`, Default: `10`
   */
  count?: number | null;
  /**
   * `kladr_id` или массив `kladr_id` региона/города, который нужно приоритизировать в подсказках.
   * Соответствует параметру API `locations_boost`.
   *
   * Примеры:
   * - `55` — Омская область
   * - `63000001` — город Самара
   * - `6300000100000` — город Самара (полный код КЛАДР)
   * - `[50, 77]` — Московская область и Москва
   * - `{kladr_id: '02'}` или `[{kladr_id: '02'}, ...]` — нативный формат API DaData
   *
   * - 'address': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343795}
   * - 'fias': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425529}
   *
   * Макс: `10` элементов
   *
   * @locale EN
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
   * Ограничивает поиск конкретными локациями (параметр API `locations`).
   * Макс: `10` элементов
   *
   * Например, при `suggestType=address`, чтобы искать только по городу Воронежу и Ростовской области:
   * `:locationsFilter="[{'region':'Воронежская','city':'Воронеж'},{'region':'Ростовская'}]"`
   *
   * - Для `address`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108}
   * - Для `fias`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974}
   *
   * Для `party` и `bank` поддерживается только фильтр `kladr_id`.
   * - Для `party`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669123}
   * - Для `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106238}
   *
   * @locale EN
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
   * Ограничивает тип адресного объекта, с которого DaData начинает поиск:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house`
   *
   * Соответствует параметру API `from_bound`.
   *
   * - Для `address`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   * - Для `fias`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   *
   * @locale EN
   * Limits the type of address object from which DaData begins searching:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house`
   *
   * Corresponds to the `from_bound` API parameter.
   *
   * - For 'address': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   *
   * - 'fias': {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   */
  fromBound?: BoundType;
  /**
   * Ограничивает тип адресного объекта, до которого DaData выполняет поиск:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house` | `flat`
   *
   * Соответствует параметру API `to_bound`.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   *
   * @locale EN
   * Limits the type of address object to which DaData performs the search:
   * - `country` | `region` | `area` | `city` | `settlement` | `planning_structure` | `street` | `house` | `flat`
   *
   * Corresponds to the `to_bound` API parameter.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   */
  toBound?: BoundType;
  /**
   * Используется вместе с `locationsFilter`. Если `true`, отображаемая подсказка
   * (то есть поле `value`) будет без частей адреса до уровня ограничения.
   *
   * Например, если в фильтре указать `region`, этот регион не попадет в результат;
   * если указать `city`, из результата будут исключены и регион, и город.
   *
   * Соответствует параметру API `restrict_value`.
   *
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521}
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737934#id-Ограничениепоназваниюадресногообъекта-Адресбезрегионаигорода}
   * - {@link https://confluence.hflabs.ru/display/SGTDOC/address.value#address.value-Параметрrestrict_value}
   *
   * @locale EN
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
   * Ограничивает поиск заданным радиусом вокруг точки с широтой и долготой.
   * Пример: `{lat: '59.244634', lon: '39.913355', radius_meters: 200}`
   *
   * Соответствует параметру API `locations_geo`.
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806
   *
   * @locale EN
   * Restrict the search to a specific radius around a latitude/longitude point.
   * Example: `{lat: '59.244634', lon: '39.913355', radius_meters: 200}`
   *
   * Corresponds to the `locations_geo` API parameter.
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806
   */
  radiusFilter?: RadiusFilter;
  /**
   * Тип территориального деления:
   * - `ADMINISTRATIVE` (административное): `Московская обл, г Одинцово, село Никольское`
   * - `MUNICIPAL` (муниципальное): `Московская обл, г.о. Одинцовский, село Никольское`
   *
   * Также влияет на набор полей внутри `suggestion.data`.
   *
   * По умолчанию: `'ADMINISTRATIVE'`
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   *
   * @locale EN
   * Type of territorial division: `ADMINISTRATIVE` or `MUNICIPAL`:
   * - `ADMINISTRATIVE`: `Московская обл, г Одинцово, село Никольское`
   * - `MUNICIPAL`: `Московская обл, г.о. Одинцовский, село Никольское`
   *
   * Also affects set of fields inside `suggestion.data`
   * @default 'ADMINISTRATIVE'
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589
   */
  division?: DivisionType;
  /**
   * Язык в возвращаемых подсказках по адресам. `RU` или `EN`.
   *
   * `EN` - почти всегда простая транслитерация латиницей,
   * однако для некоторых городов, например, `"Moscow"` - поля будут содержать реальный перевод,
   * причём переведён будет также тип города - `"city"` (тогда как для других это обычно `"gorod"`).
   *
   * По умолчанию: `RU`.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=976388726}
   *
   * @locale EN
   * Display language for address suggestions. `RU` or `EN`.
   *
   * `EN` is almost always simple transliteration to latin script,
   * however, for some cities, like `"Moscow"`, fields will be translated to English,
   * including the city type (`"city"`, while for others it's often `"gorod"`).
   *
   * Default: `RU`.
   *
   * @default 'RU'.
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=976388726}
   */
  language?: Language;
  /**
   * Тип организации или банка (для подсказок `party`, `party_by`, `party_kz` и `bank`).
   *
   * - для `party`: `LEGAL` или `INDIVIDUAL`, {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176337}
   * - для `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122}
   *
   * - для `party_by`: {@link https://dadata.ru/api/suggest/party_by/}
   * - для `party_kz`: {@link https://dadata.ru/api/suggest/party_kz/}
   *
   * @locale EN
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
   * Статус организации или банка (для подсказок `party`, `party_by` и `bank`)
   * - `'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | etc`
   * - `party`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   * - `party_by`: {@link https://dadata.ru/api/suggest/party_by/}
   * - `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120}
   *
   * @locale EN
   * Organization or bank status  (for `party`, `party_by` and `bank` suggestions)
   * - `'ACTIVE' | 'LIQUIDATING' | 'LIQUIDATED' | etc`
   * - `party`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   * - `party_by`: {@link https://dadata.ru/api/suggest/party_by/}
   * - `bank`: {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120}
   */
  entityStatus?: OneOrMany<PartyStatus> | OneOrMany<PartyByStatus> | OneOrMany<BankStatus>;
  /**
   * Фильтр по типу филиала (для подсказок `party`)
   * - `MAIN` - искать только головные организации
   * - `BRANCH` - искать только филиалы
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918095
   *
   * @locale EN
   * Branch type filter (for `party` suggestions)
   * - `MAIN` - to search only for head offices
   * - `BRANCH` - search only for branches
   *
   * @see https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918095
   */
  branchType?: OneOrMany<BranchType>;
  /**
   * Фильтр по коду ОКВЭД (для подсказок `party`). Макс: `10` элементов
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1093075333}
   *
   * @locale EN
   * OKVED code filter (for `party` suggestions). Max: `10` items
   * - {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1093075333}
   */
  okved?: OneOrMany<string>;
  /**
   * Фильтр по частям ФИО (для подсказок `fio`, см. {@link https://dadata.ru/api/suggest/name/}).
   *
   * Примеры:
   * - Только имена: `['NAME']` или `NAME`
   * - Имена и отчества: `['NAME', 'PATRONYMIC']`
   * - Имена и фамилии: `['NAME', 'SURNAME']`
   *
   * @locale EN
   * Filter by FIO parts (for `fio` suggestions, see {@link https://dadata.ru/api/suggest/name/}).
   *
   * Examples:
   * - Names only: `['NAME']` or `NAME`
   * - Names and patronymics: `['NAME', 'PATRONYMIC']`
   * - Names and surnames: `['NAME', 'SURNAME']`
   */
  fioParts?: OneOrMany<FioParts>;
  /**
   * Фильтр по полу (для подсказок `fio`).
   * - `UNKNOWN` / `MALE` / `FEMALE`
   *
   * @locale EN
   * Filter by gender (for `fio` suggestions).
   * - `UNKNOWN` / `MALE` / `FEMALE`
   */
  fioGender?: FioGenders;
  /**
   * Фильтры для API, у которых нет отдельных props-опций,
   * например `fms_unit`, `fns_unit`, `metro`, `mktu`, `okpd2`, `okved2`, `postal_unit`, `court`.
   *
   * Чтобы задать `filters` для `party_by` и `party_kz`, используйте `entityStatus`
   * и `entityType`, как и для обычного `party`.
   *
   * @locale EN
   * Filters for APIs that don't have dedicated options props,
   * like `fms_unit`, `fns_unit`, `metro`, `mktu`, `okpd2`, `okved2`, `postal_unit`, `court`.
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
    | SuggestCourtFilter
  >;

  // ***************************
  // Component features options
  // ***************************

  /**
   * Задержка (в мс) после изменения ввода (`query`) перед отправкой запроса.
   *
   * Работает по принципу debounce: если ввод продолжает изменяться,
   * запрос не будет отправлен до тех пор, пока с последнего изменения
   * не прошло это количество миллисекунд.
   *
   * По умолчанию `100`
   *
   * @locale EN
   * Delay (in ms) after changing the input (`query`) before sending the request.
   *
   * Works on the principle of debounce: if the input continues to change,
   * the request will not be sent until this number of milliseconds has passed
   * since the last change.
   *
   * Default `100`
   */
  debounce?: number;
  /**
   * Минимальная длина ввода (`query`), начиная с которой подсказки начинают работать.
   * По умолчанию `1`
   *
   * @locale EN
   * Minimum length of input after which suggestions are triggered.
   * Default `1`
   */
  minChars?: number;
  /**
   * Задаёт атрибут `disabled` у поля ввода, отключает подсказки и все взаимодействия.
   * По умолчанию `false`
   *
   * @locale EN
   * Sets the `disabled` attribute on the input element, disables suggestions and all interactions.
   * Default `false`
   */
  disabled?: boolean;
  /**
   * Текст для атрибута `placeholder` у поля ввода.
   *
   * @locale EN
   * Text used for the input's `placeholder` attribute.
   */
  placeholder?: string;
  /**
   * Значение атрибута `name` у поля ввода.
   * По умолчанию `dadata-input`
   *
   * @locale EN
   * Value for the input's `name` attribute.
   * Default `dadata-input`
   */
  inputName?: string;
  /**
   * Пользовательские имена CSS-классов для элементов компонента.
   * Значения по умолчанию: {@link DEFAULT_CLASSES}
   *
   * @locale EN
   * Custom CSS classes names for component elements.
   * Defaults: {@link DEFAULT_CLASSES}
   */
  classes?: VueDadataClasses;
  /**
   * Дополнительные атрибуты для элемента ввода.
   *
   * Полезно для управления поведением браузера (`autocomplete`, `autocapitalize`, `inputmode`,
   * `enterkeyhint` и т.п.)
   *
   * Важно:
   * - Критичные атрибуты и обработчики событий (`value`, `onInput`, `onBlur` и т.п.)
   *   управляются внутри компонента и не могут быть переопределены.
   * - Состояние `disabled` нужно задавать через prop `disabled` у `VueDadata`,
   *   а не через `inputAttributes`.
   * - Чтобы слушать `onFocus`/`onBlur`, используйте `@focus`/`@blur` на компоненте `VueDadata`.
   *
   * **Пример:**
   * ```vue
   * <VueDadata :input-attributes="{ autocomplete: 'one-time-code', inputmode: 'numeric' }" />
   * ```
   *
   * @locale EN
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
   * Управляет тем, в каких случаях при фокусе на поле ввода должен быть показан список подсказок.
   *
   * - `false`: никогда не показывать список по фокусу
   * - `'always'`: всегда показывать список по фокусу, если поле ввода не пустое и список подсказок не пуст
   * - `'no_selection'`: показывать список по фокусу, если сейчас нет выбранной подсказки
   *
   * По умолчанию: `'no_selection'`
   *
   * @locale EN
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
   * Если `true`, при потере полем ввода фокуса будет автоматически "выбрана" первая подсказка.
   * По умолчанию: `false`
   *
   * @locale EN
   * If `true`, the first suggestion will be auto-selected after input lost focus.
   * Default: `false`
   */
  selectOnBlur?: boolean;
  /**
   * Если `true`, нажатие Enter выбирает первую подсказку, если список открыт.
   * По умолчанию: `true`
   *
   * @locale EN
   * If `true`, pressing Enter selects the first suggestion (if list is open).
   * Default: `true`
   */
  selectOnEnter?: boolean;
  /**
   * Нужно ли отправлять дополнительный запрос после выбора подсказки, чтобы дополнить ее
   * данными вроде `geo_lat`, `geo_lon`, `city_district` (а также получить полный `value`,
   * если используется `restrictValue`).
   *
   * Поставьте `false`, если хотите сэкономить запросы к API и эти данные вам не нужны.
   * По умолчанию: `true`
   *
   * @locale EN
   * Whether to send an additional request after a suggestion is selected to enrich it with
   * data like `geo_lat`, `geo_lon`, `city_district` (and full `value` when `restrictValue` is used).
   *
   * Set to `false` if you want to save API usage and don’t need that data.
   * Default: `true`
   */
  enrichOnSelect?: boolean;
  /**
   * Определяет, удалять ли объект выбранной подсказки из `v-model:suggestion`
   * при изменении текста ввода (`query`).
   *
   * - `false`: выбранная подсказка никогда не очищается при изменении query
   * - `'any'`: подсказка очищается при любом изменении query
   * - `'significant'`: подсказка очищается только если новое значение query после нормализации
   *   (`trim`, case-folding) отличается от предыдущего
   *
   * По умолчанию: `'significant'`
   *
   * @locale EN
   * Determines whether the suggestion (i.e., `v-model:suggestion`) is cleared when the input changes after a suggestion is selected.
   *
   * - `false`: The suggestion is never cleared when the input changes.
   * - `'any'`: The suggestion is cleared whenever input value is changed.
   * - `'significant'`: The suggestion is cleared only if the new input, after being normalized (i.e., trimmed and case-normalized), differs from the previous value.
   *
   * Default: `'significant'`
   */
  clearOnChange?: ClearOnChangeOption;
  /**
   * Если `true`, после выбора подсказки в input будет добавлен пробел. Например,
   * пользователь сможет выбрать улицу и сразу продолжить вводить номер дома.
   * По умолчанию `true`
   *
   * @locale EN
   * If `true`, adds a space to the input after a suggestion is selected. This way, for example,
   * user can select street and then type house number without adding a space by himself.
   * Default `true`
   */
  addSpace?: boolean;
  /**
   * Если `true`, список подсказок останется видимым после выбора подсказки.
   * По умолчанию: `false`
   *
   * @locale EN
   * If `true`, the suggestions list will remain visible after selecting a suggestion.
   * Default: `false`
   */
  continueSelecting?: boolean;
  /**
   * Если `true`, в непустом поле ввода будет показываться кнопка очистки (×).
   * По умолчанию: `false`
   *
   * @locale EN
   * If `true`, shows a clear (×) button in the input when not empty.
   * Default: `false`
   */
  showClearButton?: boolean;
  /**
   * Текст, который отображается над списком подсказок.
   *
   * @locale EN
   * Text to show above the suggestions list
   */
  suggestionsHint?: string;
  /**
   * Текст, отображаемый на месте подсказок, когда ничего не найдено.
   *
   * Если используете слот `#hint`, передайте `true` для отображения своего элемента
   * при отсутствии подсказок, чтобы контейнер оставался видимым.
   *
   * @locale EN
   * Text to show in place of suggestions when there are no suggestions. Pass `true`
   * if you use the `hint` slot for displaying a custom "no-suggestions" design to keep it visible.
   */
  noSuggestionsHint?: string | boolean;
  /**
   * Если `true`, input сразу получит фокус после загрузки компонента (хук `onMounted`).
   * По умолчанию `false`
   *
   * @locale EN
   * If `true`, input will be focused immediately when the component is mounted.
   * Default `false`
   */
  focusOnMounted?: boolean;
  /**
   * Принудительно держит список подсказок видимым.
   * Полезно во время разработки, при настройке стилей, и т.д.
   * По умолчанию: `false`
   *
   * @locale EN
   * Forces the suggestions list to always remain visible.
   * Useful during development (e.g., when styling elements).
   * Default: `false`
   */
  forceShow?: boolean;
  /**
   * Принудительно держит список подсказок скрытым.
   * По умолчанию: `false`
   *
   * @locale EN
   * Forces the suggestions list to always remain hidden.
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
