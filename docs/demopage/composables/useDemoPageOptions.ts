import { BOUND_TYPES } from '@dadata-sdk/api-types';
import type { SuggestType } from '@dadata-sdk/api-types';
import { DEFAULT_OPTIONS } from '@dadata-sdk/vue';
import type { VueDadataOptions } from '@dadata-sdk/vue';
import { type Ref, computed, ref } from 'vue';

import { API_OPTIONS_KEYS, BEHAVIOR_OPTIONS_KEYS } from '../demo-page.const';
import { useSyncUrlParams } from './useSyncUrlParams';

type Translate = (key: string, ...args: unknown[]) => string;
type OptionKey = keyof VueDadataOptions;
type UrlSyncedOptions = Record<string, unknown> & VueDadataOptions;

const TOKEN_PLACEHOLDER = '***************************';

const cloneOptions = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const isEqualWithUndefined = (valueThatIsPossiblyUndefined: unknown, valueToTest: unknown) =>
  valueToTest === valueThatIsPossiblyUndefined ||
  (typeof valueThatIsPossiblyUndefined === 'undefined' &&
    (valueToTest === false || (typeof valueToTest === 'string' && !valueToTest)));

const getOptionKeys = (options: VueDadataOptions): OptionKey[] =>
  Object.keys(options) as OptionKey[];

const getGeneralOptionKeys = (options: VueDadataOptions): OptionKey[] =>
  getOptionKeys(options).filter(
    (key) => !API_OPTIONS_KEYS.includes(key) && !BEHAVIOR_OPTIONS_KEYS.includes(key),
  );

const getDiff = (
  defaults: Partial<VueDadataOptions>,
  current: VueDadataOptions,
): Partial<VueDadataOptions> => {
  const defaultsRecord = defaults as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) => !isEqualWithUndefined(defaultsRecord[key], value),
    ),
  ) as Partial<VueDadataOptions>;
};

const resetOptionGroup = <K extends OptionKey>(
  options: VueDadataOptions,
  defaults: VueDadataOptions,
  keys: readonly K[],
) => {
  keys.forEach((key) => {
    options[key] = defaults[key];
  });
};

const isOptionGroupDefault = (
  options: VueDadataOptions,
  defaults: VueDadataOptions,
  keys: readonly OptionKey[],
) => !keys.find((key) => !isEqualWithUndefined(defaults[key], options[key]));

const buildLocationsExamples = (
  suggestType: SuggestType,
  t: Translate,
): Record<string, VueDadataOptions['locationsFilter']> => {
  const examples: Record<string, VueDadataOptions['locationsFilter']> = {
    [t('Without restrictions')]: undefined,
    [t('One region')]: { region: 'краснодарский' },
    [t('One city')]: { region: 'краснодарский', city: 'сочи' },
    [t('Few regions')]: [{ region: 'Воронежская' }, { region: 'Ростовская' }],
    [t('Few locations')]: [{ region: 'Воронежская', city: 'Воронеж' }, { region: 'Ростовская' }],
    [t('Different keys')]: [{ region: 'Москва' }, { kladr_id: '78' }],
    [t('Location defined by different keys')]: {
      region_fias_id: 'd00e1013-16bd-4c09-b3d5-3cb09fc54bd8',
      city: 'Сочи',
    },
    [t('FIAS id')]: { fias_id: 'd00e1013-16bd-4c09-b3d5-3cb09fc54bd8' },
    [t('KLADR id')]: { kladr_id: '6300000100000' },
  };

  if (suggestType === 'address') {
    return {
      ...examples,
      [t('Country ISO code')]: { country_iso_code: 'KZ' },
      [t('Region ISO code')]: { country_iso_code: 'DE', region_iso_code: 'DE-HE' },
      [t('Country and region')]: { country: 'Беларусь', region: 'Брестская' },
      [t('Allow any country')]: { country: '*' },
    };
  }

  return examples;
};

export function useDemoPageOptions(params: {
  envToken: string;
  lang: Readonly<Ref<'en' | 'ru'>>;
  t: Translate;
}) {
  const { envToken, lang, t } = params;

  const defaultOptions = computed<VueDadataOptions>(() => ({
    ...DEFAULT_OPTIONS,
    token: envToken,
    placeholder: t('Start typing...'),
    suggestionsHint:
      lang.value === 'ru' ? DEFAULT_OPTIONS.suggestionsHint : 'Select suggestion or keep typing',
  }));

  const options = ref(cloneOptions(defaultOptions.value)) as Ref<VueDadataOptions>;

  const showCustomPayload = ref(false);
  const showCustomHeaders = ref(false);

  const nonDefaultOptions = computed<Partial<VueDadataOptions>>(() =>
    getDiff(DEFAULT_OPTIONS, options.value),
  );

  const nonDefaultPlaygroundOptions = computed<Partial<VueDadataOptions>>(() => ({
    ...getDiff(defaultOptions.value, options.value),
    token: undefined,
  }));

  useSyncUrlParams(
    options as Ref<UrlSyncedOptions>,
    nonDefaultPlaygroundOptions as Ref<Partial<UrlSyncedOptions>>,
  );

  const isTokenProvided = computed(() => options.value.token !== envToken);

  const tokenModel = computed({
    get: () => (isTokenProvided.value ? options.value.token : ''),
    set: (value) => {
      options.value.token = value?.trim() ? value.trim() : envToken;
    },
  });

  const locationsBoostString = ref('');
  const locationsBoostModel = computed({
    get: () => locationsBoostString.value,
    set: (value: string) => {
      locationsBoostString.value = value;

      const ids = value.split(/[^\d\wа-яё]/gi).filter(Boolean);
      options.value.locationsBoost = ids.length ? (ids.length === 1 ? ids[0] : ids) : undefined;
    },
  });

  const locationsExamples = computed(() =>
    buildLocationsExamples(options.value.suggestType || DEFAULT_OPTIONS.suggestType, t),
  );

  const boundTypesOptions = computed(() =>
    Object.fromEntries(
      BOUND_TYPES.filter(
        (boundType) =>
          options.value.suggestType === 'address' ||
          (boundType !== 'country' && boundType !== 'flat'),
      ).map((boundType) => [t(boundType), boundType]),
    ),
  );

  const boundTypesOptionsFrom = computed(() =>
    Object.fromEntries(
      Object.entries(boundTypesOptions.value).filter(([, boundType]) => boundType !== 'flat'),
    ),
  );

  const allOptionsDefault = computed(() =>
    isOptionGroupDefault(
      options.value,
      defaultOptions.value,
      getOptionKeys(options.value),
    ),
  );

  const allApiOptionsDefault = computed(() =>
    isOptionGroupDefault(options.value, defaultOptions.value, API_OPTIONS_KEYS),
  );

  const allBehaviorOptionsDefault = computed(() =>
    isOptionGroupDefault(options.value, defaultOptions.value, BEHAVIOR_OPTIONS_KEYS),
  );

  const allGeneralOptionsDefault = computed(() =>
    isOptionGroupDefault(
      options.value,
      defaultOptions.value,
      getGeneralOptionKeys(options.value),
    ),
  );

  const resetApiOptions = () => {
    resetOptionGroup(options.value, defaultOptions.value, API_OPTIONS_KEYS);
    locationsBoostString.value = '';
  };

  const resetBehaviorOptions = () => {
    resetOptionGroup(options.value, defaultOptions.value, BEHAVIOR_OPTIONS_KEYS);
  };

  const resetGeneralOptions = () => {
    resetOptionGroup(
      options.value,
      defaultOptions.value,
      getGeneralOptionKeys(options.value),
    );
    showCustomHeaders.value = false;
    showCustomPayload.value = false;
  };

  const resetAllOptions = () => {
    resetGeneralOptions();
    resetBehaviorOptions();
    resetApiOptions();
  };

  const removeCustomPayload = () => {
    showCustomPayload.value = false;
    options.value.payload = undefined;
  };

  const removeCustomHeaders = () => {
    showCustomHeaders.value = false;
    options.value.headers = undefined;
  };

  return {
    TOKEN_PLACEHOLDER,
    allApiOptionsDefault,
    allBehaviorOptionsDefault,
    allGeneralOptionsDefault,
    allOptionsDefault,
    boundTypesOptions,
    boundTypesOptionsFrom,
    defaultOptions,
    isTokenProvided,
    locationsBoostModel,
    locationsExamples,
    nonDefaultOptions,
    nonDefaultPlaygroundOptions,
    options,
    removeCustomHeaders,
    removeCustomPayload,
    resetAllOptions,
    resetApiOptions,
    resetBehaviorOptions,
    resetGeneralOptions,
    showCustomHeaders,
    showCustomPayload,
    tokenModel,
  };
}
