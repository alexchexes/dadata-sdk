<script lang="ts" setup>
import {
  BANK_STATUSES,
  BANK_TYPES,
  BASE_SUGGEST_URL,
  BOUND_TYPES,
  BRANCH_TYPES,
  DIVISION_TYPES,
  FIO_GENDERS,
  FIO_PARTS,
  LANGUAGES,
  MAX_SUG_COUNT,
  PARTY_BY_STATUSES,
  PARTY_BY_TYPES,
  PARTY_KZ_TYPES,
  PARTY_STATUSES,
  PARTY_TYPES,
  SUGGEST_TYPES,
} from '@dadata-sdk/api-types';
import type { DeepPartial, SuggestType } from '@dadata-sdk/api-types';
import { buildPayload } from '@dadata-sdk/vue';
import { CLEAR_ON_CHANGE_OPTIONS, DEFAULT_OPTIONS, SHOW_ON_FOCUS_OPTIONS } from '@dadata-sdk/vue';
import { VueDadata } from '@dadata-sdk/vue';
import type { DadataSuggestion, SuggestOptions, VueDadataOptions } from '@dadata-sdk/vue';
import '@dadata-sdk/vue/dist/vue-dadata.css';
import { ignorableWatch, useMediaQuery } from '@vueuse/core';
import { type Ref, computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import LiveSnippet from './components/LiveSnippet.vue';
import LocationsFilter from './components/LocationsFilter.vue';
import OptionsBlock from './components/OptionsBlock.vue';
import RadiusFilter from './components/RadiusFilter.vue';
import AButton from './components/ui/AButton.vue';
import ButtonAdd from './components/ui/ButtonAdd.vue';
import ButtonRemove from './components/ui/ButtonRemove.vue';
import CheckBox from './components/ui/CheckBox.vue';
import IconCross from './components/ui/IconCross.vue';
import IconReset from './components/ui/IconReset.vue';
import InputJson from './components/ui/InputJson.vue';
import InputText from './components/ui/InputText.vue';
import RadioGroup from './components/ui/RadioGroup.vue';
import SelectOptions from './components/ui/SelectOptions.vue';
import TogglesGroup from './components/ui/TogglesGroup.vue';
import { useSyncUrlParams } from './composables/useSyncUrlParams';
import './demopage.css';
import demopageMessages from './locales';

const { lang = 'en' } = defineProps<{
  lang?: 'en' | 'ru';
}>();

watch(
  () => lang,
  (v) => (locale.value = v),
);

const { t, locale } = useI18n({
  messages: demopageMessages,
  useScope: 'local',
});

locale.value = lang;

const SUGGEST_TYPES_ORDER: SuggestType[] = [
  'address',
  'fias',
  'party',
  'party_by',
  'party_kz',
  'bank',
  'fio',
  'email',
  'fms_unit',
  'postal_unit',
  'fns_unit',
  'fts_unit',
  'region_court',
  'metro',
  'car_brand',
  'mktu',
  'country',
  'currency',
  'okved2',
  'okpd2',
  'oktmo',
];

const ORDERED_SUGGEST_TYPES: SuggestType[] = [
  ...SUGGEST_TYPES_ORDER,
  ...SUGGEST_TYPES.filter((item) => !SUGGEST_TYPES_ORDER.includes(item)),
];

// API Token
const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;

const showLiveSnippet = ref(true); // @todo temp
const showAllOptions = ref(false);
const showBuiltPayload = ref(false);

const query = ref('');
const suggestion = ref<DadataSuggestion | undefined>(undefined);

const nowrapQuery = ref(true);
const examplesShown = ref(false);

const defaultOptions = computed<VueDadataOptions>(() => ({
  ...DEFAULT_OPTIONS,
  token: envToken,
  placeholder: t('Start typing...'),
  suggestionsHint:
    lang == 'ru' ? DEFAULT_OPTIONS.suggestionsHint : 'Select suggestion or keep typing',
}));

const options = ref<VueDadataOptions>(JSON.parse(JSON.stringify(defaultOptions.value)));

const isEqualWithUndefined = (valThatIsPossiblyUndefined: any, valToTest: any) =>
  valToTest === valThatIsPossiblyUndefined ||
  (typeof valThatIsPossiblyUndefined === 'undefined' &&
    (valToTest === false || (typeof valToTest === 'string' && !valToTest)));

const getDiff = (defaults: Record<string, any>, current: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(current).filter(
      ([key, val]) => !isEqualWithUndefined(defaults[key as keyof VueDadataOptions], val),
    ),
  );

const nonDefaultOptions = computed<Partial<VueDadataOptions>>(() =>
  getDiff(DEFAULT_OPTIONS, options.value),
);

const nonDefaultPlaygroundOptions = computed<Partial<VueDadataOptions>>(() => ({
  ...getDiff(defaultOptions.value, options.value),
  token: undefined,
}));

useSyncUrlParams(options as Ref<VueDadataOptions>, nonDefaultPlaygroundOptions);

const filtersInput = ref('');
const filtersValid = ref(true);

const showCustomPayload = ref(false);
const showCustomHeaders = ref(false);

const { ignoreUpdates: ignoreFiltersInputWatch } = ignorableWatch(filtersInput, (str: string) => {
  ignoreOptionsFiltersWatch(() => {
    let filters = undefined;
    let valid = true;

    if (str.trim()) {
      try {
        const parsed = JSON.parse(str.trim());

        if (Array.isArray(parsed) || typeof parsed === 'object') {
          filters = parsed;
        } else {
          valid = false;
        }
      } catch {
        valid = false;
      }
    }

    options.value.filters = filters;
    filtersValid.value = valid;
  });
});

const { ignoreUpdates: ignoreOptionsFiltersWatch } = ignorableWatch(
  () => options.value.filters,
  (filters) => {
    ignoreFiltersInputWatch(() => {
      filtersInput.value = filters ? JSON.stringify(filters) : '';
      filtersValid.value = true;
    });
  },
);

const isTokenProvided = computed(() => options.value.token !== envToken);
const TOKEN_PLACEHOLDER = '***************************';

const tokenModel = computed({
  get: () => (isTokenProvided.value ? options.value.token : ''),
  set: (val) => (options.value.token = val?.trim() ? val.trim() : envToken),
});

// locationsBoost
const locationsBoostString = ref<string>('');
const locationsBoostModel = computed({
  get: () => locationsBoostString.value,
  set: (str) => {
    locationsBoostString.value = str;
    const ids = str.split(/[^\d\wа-яё]/gi).filter(Boolean);
    options.value.locationsBoost = ids.length ? (ids.length === 1 ? ids[0] : ids) : undefined;
  },
});

// locationsFilter option
const locationsExamples = computed(() => {
  let examples;

  examples = {
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

  if (options.value.suggestType === 'address') {
    examples = {
      ...examples,
      [t('Country ISO code')]: { country_iso_code: 'KZ' },
      [t('Region ISO code')]: { country_iso_code: 'DE', region_iso_code: 'DE-HE' },
      [t('Country and region')]: { country: 'Беларусь', region: 'Брестская' },
      [t('Allow any country')]: { country: '*' },
    };
  }

  return examples;
});

const apiOptionsKeys: (keyof VueDadataOptions)[] = [
  'count',
  'fromBound',
  'toBound',
  'locationsFilter',
  'restrictValue',
  'locationsBoost',
  'division',
  'radiusFilter',
  'language',
  'entityType',
  'entityStatus',
  'branchType',
  'okved',
  'fioParts',
  'fioGender',
];

const behaviorOptionsKeys: (keyof VueDadataOptions)[] = [
  'debounce',
  'minChars',
  'disabled',
  'placeholder',
  'inputName',
  'inputAttributes',
  'suggestionsHint',
  'noSuggestionsHint',
  'classes',
  'showOnFocus',
  'selectOnBlur',
  'selectOnEnter',
  'enrichOnSelect',
  'clearOnChange',
  'addSpace',
  'continueSelecting',
  'showClearButton',
  'focusOnMounted',
  'forceShow',
  'forceHide',
];

const allOptionsDefault = computed(
  () =>
    !Object.keys(options.value).find(
      (key) =>
        !isEqualWithUndefined(
          defaultOptions.value[key as keyof VueDadataOptions],
          options.value[key as keyof VueDadataOptions],
        ),
    ),
);

const allApiOptionsDefault = computed(
  () =>
    !apiOptionsKeys.find(
      (key) => !isEqualWithUndefined(defaultOptions.value[key], options.value[key]),
    ),
);

const allBehaviorOptionsDefault = computed(
  () =>
    !behaviorOptionsKeys.find(
      (key) => !isEqualWithUndefined(defaultOptions.value[key], options.value[key]),
    ),
);

const allGeneralOptionsDefault = computed(
  () =>
    !Object.keys(options.value)
      .filter(
        (key) =>
          !apiOptionsKeys.includes(key as keyof VueDadataOptions) &&
          !behaviorOptionsKeys.includes(key as keyof VueDadataOptions),
      )
      .find(
        (key) =>
          !isEqualWithUndefined(
            defaultOptions.value[key as keyof VueDadataOptions],
            options.value[key as keyof VueDadataOptions],
          ),
      ),
);

/** Calls the given function only if the user has not selected any text. */
const noSelectionClick = <T,>(fn: () => T): T | void => {
  if (document.getSelection()?.type === 'Range') {
    return;
  }
  return fn();
};

const resetAllOptions = () => {
  resetGeneralOptions();
  resetBehaviorOptions();
  resetApiOptions();
};

const resetApiOptions = () => {
  apiOptionsKeys.forEach((key) => {
    // @ts-ignore @ts-fuckyourself
    options.value[key] = defaultOptions.value[key];
  });
  locationsBoostString.value = '';
};

const resetBehaviorOptions = () => {
  behaviorOptionsKeys.forEach((key) => {
    // @ts-ignore @ts-fuckyourself
    options.value[key] = defaultOptions.value[key];
  });
};

const resetGeneralOptions = () => {
  Object.keys(options.value).forEach((key) => {
    if (
      !apiOptionsKeys.includes(key as keyof VueDadataOptions) &&
      !behaviorOptionsKeys.includes(key as keyof VueDadataOptions)
    ) {
      // @ts-ignore @ts-fuckyourself
      options.value[key] = defaultOptions.value[key];
    }
  });
  showCustomHeaders.value = false;
  showCustomPayload.value = false;
};

const clearSuggestion = () => {
  query.value = '';
  suggestion.value = undefined;
};

const handleEnriched = (
  suggestion: DadataSuggestion,
  diff: DeepPartial<DadataSuggestion> | null,
) => {
  shownError.value = null;
  showTokenError.value = false;
  console.info(`Suggestion enriched (${suggestion.value}), diff:`, diff);
};

const handleEnrichFail = (unrestricted_value: string) => {
  console.warn('Failed to enrich suggestion:', unrestricted_value);
};

const shownError = ref<{ title: string; description?: string | null } | null>(null);
const showTokenError = ref(false);

const handleError = (error: any) => {
  console.error('VueDadata error:', error);

  if (error && typeof error === 'object') {
    if (error.status === 403) {
      showTokenError.value = true;
      return;
    }
    showTokenError.value = false;
    shownError.value = {
      title: t('Something went wrong...'),
      description: error,
    };
  }
};

const removeCustomPayload = () => {
  showCustomPayload.value = false;
  options.value.payload = undefined;
};
const removeCustomHeaders = () => {
  showCustomHeaders.value = false;
  options.value.headers = undefined;
};

const vueDadataRef = useTemplateRef('vueDadataRef');

const isScreenXl = useMediaQuery('(width >= 80rem)');
const isScreenMd = useMediaQuery('(width >= 48rem)');

const behaviorOptionsCollapsed = ref(false);
const apiOptionsCollapsed = ref(false);
const generalOptionsCollapsed = ref(false);

onMounted(() => {
  behaviorOptionsCollapsed.value = !isScreenXl.value;
  apiOptionsCollapsed.value = !isScreenMd.value;
});

const builtPayload = computed(() =>
  buildPayload({ ...options.value, query: query.value } as SuggestOptions),
);

const boundTypesOptions = computed(() => {
  return Object.fromEntries(
    BOUND_TYPES.filter(
      (el) => options.value.suggestType === 'address' || (el !== 'country' && el !== 'flat'),
    ).map((boundType) => [t(boundType), boundType]),
  );
});
const boundTypesOptionsFrom = computed(() => {
  return Object.fromEntries(
    Object.entries(boundTypesOptions.value).filter(([, boundType]) => boundType !== 'flat'),
  );
});
</script>

<template>
  <div class="text-(--vp-c-text-1)">
    <AButton
      v-if="!allOptionsDefault"
      class="fixed top-5 left-1/2 z-50 flex -translate-x-1/2 gap-1 pr-1.5 text-sm text-(--vp-c-text-2)"
      @click="resetAllOptions"
    >
      {{ t('Reset all') }}
      <IconReset height="20" width="20" />
    </AButton>

    <!-- Grid container -->
    <div
      class="grid grid-cols-1 grid-rows-[auto_1fr] gap-4 p-4 md:grid-cols-[20rem_1fr] xl:mx-auto xl:max-w-(--breakpoint-2xl) xl:grid-cols-[20rem_auto_20rem]"
    >
      <!-- Component behavior options -->
      <aside class="md:row-start-1 xl:col-start-1 xl:row-start-1">
        <OptionsBlock
          v-model="behaviorOptionsCollapsed"
          :canReset="!allBehaviorOptionsDefault"
          :heading="t('Vue component options')"
          :resetLable="t('Reset') + ' ' + t('Vue component options')"
          @resetClick="resetBehaviorOptions"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span title=':minChars="..."'> {{ t('minChars') }}: </span>

            <div class="flex items-center gap-2">
              <ButtonRemove
                outline
                @click="options.minChars = Math.max(1, (options.minChars || 1) - 1)"
              />

              <input
                v-model.number="options.minChars"
                class="w-20 rounded-lg border bg-white px-1.5 py-0.5 dark:bg-(--vp-input-bg-color)"
                min="1"
                step="1"
                type="number"
              />
              <ButtonAdd outline @click="options.minChars = (options.minChars || 0) + 1" />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span title=':debounce="..."'> {{ t('debounce') }}: </span>
            <div class="flex items-center gap-2">
              <ButtonRemove
                outline
                @click="options.debounce = Math.max(0, (options.debounce || 0) - 50)"
              />

              <input
                v-model.number="options.debounce"
                class="w-20 rounded-lg border bg-white px-1.5 py-0.5 dark:bg-(--vp-input-bg-color)"
                min="0"
                step="1"
                type="number"
              />
              <ButtonAdd outline @click="options.debounce = (options.debounce || 0) + 50" />
            </div>
          </div>

          <RadioGroup
            v-model="options.showOnFocus"
            :label="t('showOnFocus')"
            :options="
              Object.fromEntries(SHOW_ON_FOCUS_OPTIONS.map((item) => [t(item.toString()), item]))
            "
          />

          <RadioGroup
            v-model="options.clearOnChange"
            :label="t('clearOnChange')"
            :options="
              Object.fromEntries(CLEAR_ON_CHANGE_OPTIONS.map((item) => [t(item.toString()), item]))
            "
          />

          <CheckBox v-model="options.selectOnBlur" :label="t('selectOnBlur')" />
          <CheckBox v-model="options.selectOnEnter" :label="t('selectOnEnter')" />
          <CheckBox v-model="options.enrichOnSelect" :label="t('enrichOnSelect')" />
          <CheckBox v-model="options.addSpace" :label="t('addSpace')" />
          <CheckBox v-model="options.continueSelecting" :label="t('continueSelecting')" />
          <CheckBox v-model="options.showClearButton" :label="t('showClearButton')" />
          <CheckBox v-model="options.forceShow" :label="t('forceShow')" />
          <CheckBox v-model="options.forceHide" :label="t('forceHide')" />
          <CheckBox :label="t('focusOnMounted')" checked disabled />
          <CheckBox v-model="options.disabled" :label="t('disabled')" />
          <InputText
            v-model="options.placeholder"
            :label="t('placeholder:')"
            :placeholder="t('Not specified')"
          />
          <InputText
            v-model="options.suggestionsHint"
            :label="t('suggestionsHint:')"
            :placeholder="t('Not specified')"
          />
          <InputText
            v-model="options.noSuggestionsHint"
            :label="t('noSuggestionsHint:')"
            :placeholder="t('Not specified')"
          />
        </OptionsBlock>
      </aside>

      <!-- API request options -->
      <aside class="md:col-start-1 md:row-start-2 xl:col-start-3 xl:row-start-1">
        <OptionsBlock
          v-model="apiOptionsCollapsed"
          :canReset="!allApiOptionsDefault"
          :heading="t('API request options')"
          :resetLable="`${t('Reset')} ${t('API request options')}`"
          @resetClick="resetApiOptions"
        >
          <div class="flex flex-wrap items-center gap-2">
            {{ t('count:') }}
            <div class="flex items-center gap-2">
              <input
                v-model.number="options.count"
                class="accent-accent"
                :max="MAX_SUG_COUNT"
                min="1"
                step="1"
                type="range"
              />
              <div class="w-5">
                {{ options.count }}
              </div>
            </div>
          </div>

          <template
            v-if="
              options.suggestType === 'address' ||
              options.suggestType === 'fias' ||
              options.suggestType === 'party' ||
              options.suggestType === 'bank'
            "
          >
            <div class="dev-item">
              <InputText
                v-model="locationsBoostModel"
                :helpLink="
                  options.suggestType === 'address'
                    ? 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343795'
                    : 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425529'
                "
                :label="t('locationsBoost:')"
                :placeholder="t(`KLADR ID or IDs, e.g. '77, 46'`)"
              />
            </div>

            <!-- example locations filters -->
            <div v-if="options.suggestType === 'address' || options.suggestType === 'fias'">
              <div>
                {{ t('locationsFilter examples:') }}
                <AButton class="text-sm" @click="examplesShown = !examplesShown">
                  {{ examplesShown ? t('Hide') : t('Show') }}
                </AButton>
              </div>

              <RadioGroup
                v-if="examplesShown"
                v-model="options.locationsFilter"
                class="mt-2 flex flex-col gap-1"
                :options="locationsExamples"
              />
            </div>

            <LocationsFilter
              v-model="options.locationsFilter"
              :helpLink="
                {
                  'address': 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108',
                  'fias': 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835974',
                  'party': 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669123',
                  'bank': 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106238',
                }[options.suggestType]
              "
              :suggestType="options.suggestType || DEFAULT_OPTIONS.suggestType"
            />
          </template>

          <!-- 'address' and 'fias' -->
          <template v-if="options.suggestType === 'address' || options.suggestType === 'fias'">
            <div class="flex flex-wrap gap-3">
              <SelectOptions
                v-model="options.fromBound"
                :helpLink="
                  options.suggestType === 'address'
                    ? 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017'
                    : 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521'
                "
                :label="t('fromBound:')"
                :options="boundTypesOptionsFrom"
              />
              <SelectOptions
                v-model="options.toBound"
                :helpLink="
                  options.suggestType === 'address'
                    ? 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=222888017'
                    : 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=968425521'
                "
                :label="t('toBound:')"
                :options="boundTypesOptions"
              />
            </div>
          </template>

          <template v-if="options.suggestType === 'address'">
            <RadiusFilter v-model="options.radiusFilter" />

            <RadioGroup
              v-model="options.division"
              :label="t('division:')"
              :options="Object.fromEntries(DIVISION_TYPES.map((item) => [t(item), item]))"
              helpLink="https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589"
            />

            <RadioGroup
              v-model="options.language"
              :label="t('language:')"
              :options="Object.fromEntries(LANGUAGES.map((item) => [t(item), item]))"
              helpLink="https://confluence.hflabs.ru/pages/viewpage.action?pageId=976388726"
            />
          </template>

          <CheckBox
            v-if="
              options.locationsFilter &&
              (options.suggestType === 'address' || options.suggestType === 'fias')
            "
            v-model="options.restrictValue"
            :label="t('restrictValue')"
          />

          <RadioGroup
            v-if="options.suggestType === 'party'"
            v-model="options.entityType"
            :label="t('entityType.label-party', 'entityType:')"
            :options="
              Object.fromEntries(
                [undefined, ...PARTY_TYPES].map((item) => [
                  t(item ? `entityType.${item}` : 'entityType.any', item || 'any'),
                  item,
                ]),
              )
            "
            helpLink="https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176337"
          />
          <TogglesGroup
            v-else-if="options.suggestType === 'party_by'"
            v-model="options.entityType"
            :label="t('entityType.label-party', 'entityType:')"
            :options="
              Object.fromEntries(
                PARTY_BY_TYPES.map((item) => [t(`entityType.${item}`, item), item]),
              )
            "
            helpLink="https://dadata.ru/api/suggest/party_by/#:~:text=UTF%2D8.-,%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F,-%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D0%B5%D1%82%20%D0%BF%D0%BE"
          />
          <TogglesGroup
            v-else-if="options.suggestType === 'party_kz'"
            v-model="options.entityType"
            :label="t('entityType.label-party', 'entityType:')"
            :options="
              Object.fromEntries(
                PARTY_KZ_TYPES.map((item) => [t(`entityType.${item}`, item), item]),
              )
            "
            helpLink="https://dadata.ru/api/suggest/party_kz/#:~:text=UTF%2D8.-,%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F,-%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D0%B5%D1%82%20%D0%BF%D0%BE"
          />
          <TogglesGroup
            v-else-if="options.suggestType === 'bank'"
            v-model="options.entityType"
            :label="t('entityType.label-bank', 'entityType:')"
            :options="
              Object.fromEntries(BANK_TYPES.map((item) => [t(`entityType.${item}`, item), item]))
            "
            helpLink="https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122"
          />

          <TogglesGroup
            v-if="
              options.suggestType === 'party' ||
              options.suggestType === 'party_by' ||
              options.suggestType === 'bank'
            "
            v-model="options.entityStatus"
            :helpLink="
              {
                party: 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335',
                bank: 'https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120',
                party_by:
                  'https://dadata.ru/api/suggest/party_by/#:~:text=UTF%2D8.-,%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F,-%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D0%B5%D1%82%20%D0%BF%D0%BE',
              }[options.suggestType]
            "
            :label="t(`entityStatus.${options.suggestType}.label`, 'entityStatus:')"
            :options="
              Object.fromEntries(
                {
                  party: PARTY_STATUSES,
                  party_by: PARTY_BY_STATUSES,
                  bank: BANK_STATUSES,
                }[options.suggestType].map((item) => [
                  t(`entityStatus.${options.suggestType}.${item}`, item),
                  item,
                ]),
              )
            "
          />

          <RadioGroup
            v-if="options.suggestType === 'party'"
            v-model="options.branchType"
            :label="t('branchType.label', 'branchType:')"
            :options="
              Object.fromEntries(
                [undefined, ...BRANCH_TYPES].map((item) => [
                  t(item ? `branchType.${item}` : 'branchType.any', item || 'any'),
                  item,
                ]),
              )
            "
            helpLink="https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918095"
          />

          <!-- 'fio' -->
          <template v-if="options.suggestType === 'fio'">
            <TogglesGroup
              v-model="options.fioParts"
              :label="t('fioParts:')"
              :options="Object.fromEntries(FIO_PARTS.map((item) => [t(item), item]))"
            />

            <RadioGroup
              v-model="options.fioGender"
              :label="t('fioGender:')"
              :options="
                Object.fromEntries(
                  [undefined, ...FIO_GENDERS].map((item) => [t(item || 'gender-any', 'any'), item]),
                )
              "
            />
          </template>

          <InputJson
            v-if="
              [
                `fms_unit`,
                `fns_unit`,
                `metro`,
                `mktu`,
                `okpd2`,
                `okved2`,
                `postal_unit`,
                `region_court`,
              ].includes(options.suggestType as string)
            "
            v-model="options.filters"
            class="flex-col gap-1"
            :label="t('filters (json)')"
            :placeholder="t(`'filters' API request parameter`)"
            allowArray
          />
        </OptionsBlock>
      </aside>

      <!-- General options and the input -->
      <main
        class="flex w-full min-w-0 flex-col gap-3 md:col-start-2 md:row-span-2 md:row-start-1 xl:col-start-2 xl:row-start-1 xl:mx-auto xl:max-w-5xl"
      >
        <!-- Block above the input -->
        <OptionsBlock
          v-model="generalOptionsCollapsed"
          class="pb-3"
          :canReset="!allGeneralOptionsDefault"
          :heading="t('General options')"
          :resetLable="`${t('Reset')} ${t('General options')}`"
          @resetClick="resetGeneralOptions"
        >
          <div class="flex flex-col gap-4">
            <!-- API token & URL -->
            <div class="flex flex-wrap gap-2">
              <InputText
                v-model.trim="tokenModel"
                class="grow"
                :class="showTokenError && 'text-red-500 dark:text-red-400'"
                :inputClass="showTokenError && 'border-red-500! dark:border-red-400!'"
                :label="t('API token:')"
                :placeholder="TOKEN_PLACEHOLDER"
              />

              <InputText
                v-model.trim="options.url"
                class="grow"
                :placeholder="BASE_SUGGEST_URL + options.suggestType"
                label="API URL:"
              />
            </div>

            <!-- Suggestions type -->
            <div class="flex flex-wrap gap-1">
              <RadioGroup
                v-model="options.suggestType"
                :options="
                  Object.fromEntries(
                    ORDERED_SUGGEST_TYPES.map((item) => [t(`suggestTypes.${item}`, item), item]),
                  )
                "
                buttonClass="px-3 py-1.5"
              />
            </div>

            <!-- Custom payload & headers -->
            <div class="flex flex-wrap items-start gap-x-3 gap-y-2">
              <div class="flex grow basis-1/3 flex-col gap-3">
                <!-- Custom payload -->
                <div class="flex gap-2">
                  <ButtonAdd v-if="!showCustomPayload" @click="showCustomPayload = true" />
                  <ButtonRemove v-else outline @click="removeCustomPayload()" />
                  <span>
                    {{
                      showCustomPayload ? t('Remove custom payload') : t('Add custom payload...')
                    }}
                  </span>
                </div>

                <InputJson
                  v-if="showCustomPayload"
                  v-model.lazy="options.payload"
                  class="w-full"
                  :placeholder="t('customPayloadPlaceholder')"
                  :rows="4"
                />
              </div>

              <div class="flex grow basis-1/3 flex-col gap-3">
                <!-- Custom headers -->
                <div class="flex gap-2">
                  <ButtonAdd v-if="!showCustomHeaders" @click="showCustomHeaders = true" />
                  <ButtonRemove v-else outline @click="removeCustomHeaders()" />
                  <span>
                    {{
                      showCustomHeaders ? t('Remove custom headers') : t('Add custom headers...')
                    }}
                  </span>
                </div>

                <InputJson
                  v-if="showCustomHeaders"
                  v-model.lazy="options.headers"
                  class="w-full"
                  :placeholder="t('customHeadersPlaceholder')"
                  :rows="4"
                />
              </div>

              <CheckBox v-model="options.httpCache" class="gap-2" :label="t('httpCache')" />
            </div>
          </div>
        </OptionsBlock>

        <div class="flex flex-wrap items-center gap-3">
          <CheckBox v-model="showLiveSnippet" :label="t('Show live snippet')" />
          <CheckBox v-model="showAllOptions" :label="t('Show all options')" />
          <CheckBox v-model="showBuiltPayload" :label="t('Show payload')" />
        </div>

        <div v-if="showLiveSnippet">
          <LiveSnippet
            :nonDefaultOptions
            :options
            :showToken="isTokenProvided"
            :query
            :suggestion
          />
        </div>

        <pre
          v-if="showAllOptions"
          class="rounded-xl bg-(--vp-c-bg-alt) px-4 py-2 text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap"
        ><b>{{t('Current component options:')}} </b> {{ isTokenProvided ? options : {...options, token: TOKEN_PLACEHOLDER} }}</pre>

        <pre
          v-if="showBuiltPayload"
          class="rounded-xl bg-(--vp-c-bg-alt) px-4 py-2 text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap"
        ><b>{{t('Final payload:')}} </b>{{ builtPayload }}</pre>

        <!-- Current query string -->
        <div :class="nowrapQuery && 'overflow-hidden text-ellipsis whitespace-nowrap'">
          <span :class="!query && 'text-(--vp-c-text-3)'">
            {{ t('Current query:') }}
          </span>
          <!-- a space -->
          {{ ' ' }}
          <b
            :class="!query && 'text-(--vp-c-text-3) opacity-50'"
            @click="noSelectionClick(() => (nowrapQuery = !nowrapQuery))"
          >
            {{ query || '—' }}
          </b>
        </div>

        <!-- Component Exposed API -->
        <div class="flex flex-wrap gap-1">
          <div class="mr-1">
            {{ t('Methods:') }}
          </div>

          <AButton :disabled="vueDadataRef?.isFocused" @mousedown.prevent="vueDadataRef?.focus()"
            >focus</AButton
          >
          <AButton :disabled="!vueDadataRef?.isFocused" @mousedown.prevent="vueDadataRef?.blur()"
            >blur</AButton
          >
          <AButton :disabled="!query && !suggestion" @mousedown.prevent="vueDadataRef?.clear()"
            >clear</AButton
          >
          <AButton
            :disabled="
              !vueDadataRef?.suggestionsList?.length ||
              vueDadataRef?.isDropdownVisible ||
              options.forceHide
            "
            @mousedown.prevent="vueDadataRef?.show()"
            >show</AButton
          >
          <AButton
            :disabled="!vueDadataRef?.suggestionsList?.length || !vueDadataRef?.isDropdownVisible"
            @mousedown.prevent="vueDadataRef?.hide()"
            >hide</AButton
          >
        </div>

        <h2 class="text-5xl leading-relaxed font-semibold">
          {{ t('Try here:') }}
        </h2>

        <VueDadata
          ref="vueDadataRef"
          v-model="query"
          v-model:suggestion="suggestion"
          class="text-slate-950"
          :focusOnMounted="true"
          :token="options.token"
          v-bind="nonDefaultOptions"
          @enriched="handleEnriched"
          @enrichFail="handleEnrichFail"
          @error="handleError"
          @select="(sug, type) => console.log(type, JSON.parse(JSON.stringify(sug)))"
        >
        </VueDadata>

        <div
          v-if="showTokenError || shownError"
          class="relative rounded-xl bg-(--vp-c-danger-soft) px-3 py-2 text-(--vp-c-danger-1)"
        >
          <div class="font-bold">
            <template v-if="showTokenError"> {{ t('Oops...') }} </template>
            <template v-else>
              {{ shownError?.title || 'Error' }}
            </template>
          </div>
          <div>
            <template v-if="showTokenError">
              {{
                t(
                  'Looks like the API token used on this page has reached its limit. Obtain a new token from',
                )
              }}
              <a
                class="underline hover:no-underline"
                href="https://dadata.ru/api/#:~:text=%D0%BA%D0%BE%D0%B3%D0%B4%D0%B0%20%D0%BF%D0%BE%D1%80%D0%B0%20%D0%BF%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D1%8F%D1%82%D1%8C.-,%D0%97%D0%B0%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%D1%81%D1%8F,-%D0%B8%C2%A0%D0%BF%D0%BE%D0%BF%D1%80%D0%BE%D0%B1%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20API"
                rel="noopener"
                target="_blank"
                >Dadata.ru</a
              >
              {{ t('and paste it into') }} <i>'{{ t('General options') }}'</i> →
              <i>'{{ t('API token') }}'</i> {{ t('above') }}
            </template>
            <template v-else-if="shownError?.description">
              {{ shownError.description }}
            </template>
          </div>
          <button
            class="absolute top-3 right-3 cursor-pointer hover:opacity-70"
            @click="
              shownError = null;
              showTokenError = false;
            "
          >
            <IconCross />
          </button>
        </div>

        <div class="min-h-96 rounded-xl bg-(--vp-c-bg-alt) px-4 py-2">
          <div class="flex justify-between">
            <span>
              {{ t('Current suggestion:') }}
              <span v-if="!suggestion" class="text-(--vp-c-text-3) opacity-50">
                — ({{ typeof suggestion }})</span
              >
            </span>
            <AButton v-if="suggestion" @click="clearSuggestion">{{ t('Clear') }}</AButton>
          </div>

          <pre v-if="suggestion" class="text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap">{{
            suggestion
          }}</pre>
        </div>
      </main>
    </div>
  </div>
</template>
