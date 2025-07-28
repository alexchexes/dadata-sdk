export default {
  ru: {
    'Reset': 'Сбросить',
    'Reset all': 'Сбросить всё',
    'Not specified': 'Не задано',

    // --------------------------
    // Main area
    // --------------------------

    'Show live snippet': 'Интерактивный код',
    'Show all options': 'Показать все опции',
    'Show payload': 'Тело API запроса',

    'Current component options:': 'Текущий набор опций компонента:',
    'Final payload:': 'Что будет отправлено в API:',
    'Current query:': 'Текущий запрос:',
    'Methods:': 'Методы:',
    'Try here:': 'Попробовать:',
    'Current suggestion:': 'Выбранная подсказка:',
    'Clear': 'Сбросить',
    'Oops...': 'Ой...',
    'Something went wrong...': 'Что-то пошло не так...',
    'Looks like the API token used on this page has reached its limit. Obtain a new token from':
      'Похоже, API токен, используемый в этом демо, достиг суточного лимита. Получите новый токен на',
    'and paste it into': 'и вставьте его в',
    'above': 'выше',

    // --------------------------
    // Vue component options block
    // --------------------------

    'Vue component options': 'Поведение компонента',
    'minChars': 'Мин. символов',
    'debounce': 'Задержка, мс',
    'showOnFocus': 'Показать подсказки при фокусе...',
    'no_selection': 'если не выбрана',
    'always': 'всегда',
    'false': 'нет',
    'clearOnChange': 'Сброс при изменениях в поле...',
    'significant': 'при значительных',
    'any': 'при любых',
    'selectOnBlur': 'Взять 1-ю при потере фокуса',
    'selectOnEnter': 'Взять 1-ю по нажатию Enter',
    'enrichOnSelect': 'Получать доп. данные',
    'addSpace': 'Добавлять пробел',
    'continueSelecting': 'Не убирать список',
    'showClearButton': 'Отображать «крестик»',
    'forceShow': 'Всегда показывать список',
    'forceHide': 'Всегда скрывать список',
    'focusOnMounted': 'Фокус на поле при загрузке',
    'disabled': 'Деактивировать поле',
    'placeholder:': 'Плейсхолдер',
    'suggestionsHint:': 'Подсказка о подсказках',
    'noSuggestionsHint:': 'Подсказка когда нет подсказок',
    'Start typing...': 'Начните печатать...',

    // --------------------------
    // General options block
    // --------------------------

    'General options': 'Основные настройки',
    'API token:': 'API токен:',
    'API token': 'API токен',
    suggestTypes: {
      'address': 'Адреса',
      'country': 'Страны',
      'postal_unit': 'Отделения почты',

      'fias': 'Адреса (ФИАС)',

      'party': 'Организации',
      'party_by': 'Организации (BY)',
      'party_kz': 'Организации (KZ)',
      'bank': 'Банки',
      'fio': 'ФИО',

      'fms_unit': 'Кем выдан паспорт',

      'email': 'Email',

      'car_brand': 'Марки авто',

      'fns_unit': 'Налоговые',
      'fts_unit': 'Таможни',
      'region_court': 'Суды',
      'metro': 'Станции метро',
      'mktu': 'МКТУ',
      'currency': 'Валюты',
      'okved2': 'ОКВЭД',
      'okpd2': 'ОКПД',
      'oktmo': 'ОКТМО',
    },
    'Add custom payload...': 'Настроить payload...',
    'Remove custom payload': 'Убрать свой payload',
    'Add custom headers...': 'Настроить заголовки...',
    'Remove custom headers': 'Убрать свои заголовки',
    'httpCache': 'HTTP кэш',
    'customPayloadPlaceholder':
      'Здесь можно дополнить или перезаписать тело API-запроса (формат - JSON)',
    'customHeadersPlaceholder':
      'Здесь можно дополнить или перезаписать HTTP-заголовки запроса (формат - JSON)',

    // --------------------------
    // API request options block
    // --------------------------

    'API request options': 'Параметры API запроса',
    'count:': 'Макс. подсказок:',
    'locationsBoost:': 'Приоритет города/региона:',
    "KLADR ID or IDs, e.g. '77, 46'": "Коды КЛАДР, напр. '77, 46'",
    // Filters examples
    'locationsFilter examples:': 'Примеры гео-фильтров:',
    'Show': 'Показать',
    'Hide': 'Скрыть',
    'Without restrictions': 'Без фильтров',
    'One region': '1 регион',
    'One city': '1 город',
    'Few regions': 'неск. регионов',
    'Few locations': 'неск. локаций',
    'Different keys': 'разн. типы ключей',
    'Location defined by different keys': 'одна локация - разн. типы ключей',
    'FIAS id': 'ФИАС код',
    'KLADR id': 'КЛАДР код',
    'Country ISO code': 'ISO код страны',
    'Region ISO code': 'ISO код региона',
    'Country and region': 'Страна и регион',
    'Allow any country': 'Любые страны',
    // Filters
    'locationsFilter:': 'Гео-фильтры:',
    'By name of...': 'По названию...',
    'By type': 'По типу',
    'By ISO code': 'По ISO коду',
    'By FIAS ID': 'По ФИАС коду',
    'By KLADR ID': 'По КЛАДР коду',
    'enter': 'введите',
    'AND': 'И',
    'OR': 'ИЛИ',
    'Duplicating "AND" conditions': 'Ключи внутри условия типа "И" не должны повторяться',
    'filtersBy': {
      country_iso_code: 'ISO код страны',
      region_iso_code: 'ISO код региона',

      country: 'страна | страну',

      region: 'регион',
      area: 'адм.район',
      city: 'город',
      city_district: 'район города',
      settlement: 'поселение',
      street: 'улица | улицу',
      planning_structure: 'план.структура | план.структуру',

      region_type_full: 'тип региона',
      area_type_full: 'тип адм.района',
      city_type_full: 'тип города',
      city_district_type_full: 'тип района города',
      settlement_type_full: 'тип поселения',
      street_type_full: 'тип улицы',
      planning_structure_type_full: 'тип план.структуры',

      kladr_id: 'КЛАДР код',

      fias_id: 'ФИАС код',
      region_fias_id: 'ФИАС код региона',
      area_fias_id: 'ФИАС код адм.района',
      city_fias_id: 'ФИАС код города',
      settlement_fias_id: 'ФИАС код поселения',
      street_fias_id: 'ФИАС код улицы',
      planning_structure_fias_id: 'ФИАС код план.структуры',
    },
    enterRestriction: {
      country: 'страну',
      street: 'улицу',
      planning_structure: 'план.структуру',
    },
    // Bounds:
    'fromBound:': 'Верхняя граница поиска:',
    'toBound:': 'Нижняя граница поиска:',
    'country': 'страна',
    'region': 'регион',
    'area': 'адм. район',
    'city': 'город',
    'settlement': 'поселение',
    'planning_structure': 'планировочная структура',
    'street': 'улица',
    'house': 'дом',
    'flat': 'квартира',
    //
    'radiusFilter:': 'Фильтр по радиусу:',
    'lat': 'широта',
    'lon': 'долгота',
    'radius': 'радиус',
    //
    'division:': 'Деление:',
    'ADMINISTRATIVE': 'Административное',
    'MUNICIPAL': 'Муниципальное',
    //
    'language:': 'Язык подсказок:',
    'EN': 'Английский',
    'RU': 'Русский',
    //
    'restrictValue': 'Сокращать адреса в подсказках',
    //
    'filters (json)': 'Доп. фильтры (JSON)',
    "'filters' API request parameter": "Параметр 'filters' в запросе",
    //
    'fioParts:': 'Искать только в этих частях:',
    'NAME': 'Имя',
    'SURNAME': 'Фамилия',
    'PATRONYMIC': 'Отчество',
    'fioGender:': 'Фильтр по полу:',
    'MALE': 'Муж.',
    'FEMALE': 'Жен.',
    'UNKNOWN': 'неизвестный',
    'gender-any': 'любой',
    //
    entityType: {
      'label-party': 'Тип организации:',
      'label-bank': 'Тип банка:',
      'LEGAL': 'юр. лицо',
      'INDIVIDUAL': 'ИП',
      'any': 'любой',
      'INDIVIDUAL_JOINT_VENTURE': 'ИП (совместный)',
      'BRANCH': 'филиал',
      'FOREIGN_BRANCH': 'филиал иностранного юрлица',
      'CBR': 'ГУ ЦБ РФ',
      'BANK': 'банк',
      'BANK_BRANCH': 'филиал банка',
      'NKO': 'НКО',
      'NKO_BRANCH': 'филиал НКО',
      'RKC': 'расчетно-кассовый центр',
      'TREASURY': 'тер. орган казначейства',
      'OTHER': 'другое',
    },
    entityStatus: {
      party: {
        label: 'Статус организации:',
        // party
        'ACTIVE': 'действующая',
        'BANKRUPT': 'банкрот',
        'LIQUIDATED': 'ликвидирована',
        'LIQUIDATING': 'ликвидируется',
        'REORGANIZING': 'идёт слияние с др. юрлицом',
      },
      party_by: {
        label: 'Статус организации:',
        // party_by
        'ACTIVE': 'действующая',
        'BANKRUPT': 'банкрот',
        'LIQUIDATED': 'ликвидирована',
        'LIQUIDATING': 'ликвидируется',
        'REORGANIZING': 'реорганизуется',
        'SUSPENDED': 'деят. приостановлена',
      },
      bank: {
        label: 'Статус банка:',
        // bank
        'ACTIVE': 'действующий',
        'LIQUIDATED': 'ликвидирован',
        'LIQUIDATING': 'ликвидируется',
      },
    },
    branchType: {
      label: 'Тип филиала:',
      'MAIN': 'головной офис',
      'BRANCH': 'филиал',
      'any': 'любой',
    },
  },
  en: {
    customPayloadPlaceholder: 'Add or override the API request payload (must be valid JSON).',
    customHeadersPlaceholder: 'Add or override the API request headers (must be valid JSON).',
  },
} as const;
