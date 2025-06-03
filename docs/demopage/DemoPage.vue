<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef, type Ref } from 'vue';
import AButton from './components/ui/AButton.vue';
import CheckBox from './components/ui/CheckBox.vue';
import InputText from './components/ui/InputText.vue';
import LocationsFilter from './components/LocationsFilter.vue';
import RadioGroup from './components/ui/RadioGroup.vue';
import TogglesGroup from './components/ui/TogglesGroup.vue';
import RadiusFilter from './components/RadiusFilter.vue';
import SelectOptions from './components/ui/SelectOptions.vue';
import LiveSnippet from './components/LiveSnippet.vue';
import { VueDadata } from '@dadata-sdk/vue';
import '@dadata-sdk/vue/dist/vue-dadata.css';
import {
  BANK_STATUSES,
  BANK_TYPES,
  BASE_SUGGEST_URL,
  BOUND_TYPES,
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
import { CLEAR_ON_CHANGE_OPTIONS, DEFAULT_OPTIONS, SHOW_ON_FOCUS_OPTIONS } from '@dadata-sdk/vue';
import type { SuggestType, DeepPartial } from '@dadata-sdk/api-types';
import type { DadataSuggestion, SuggestOptions, VueDadataOptions } from '@dadata-sdk/vue';
import { ignorableWatch, useMediaQuery } from '@vueuse/core';
import ButtonAdd from './components/ui/ButtonAdd.vue';
import InputJson from './components/ui/InputJson.vue';
import ButtonRemove from './components/ui/ButtonRemove.vue';
import { useSyncUrlParams } from './composables/useSyncUrlParams';
import OptionsBlock from './components/OptionsBlock.vue';
import IconReset from './components/ui/IconReset.vue';
import { buildPayload } from '@dadata-sdk/vue';

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
  placeholder: 'Start typing...',
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
    'Without restrictions': undefined,
    'One region': { region: 'краснодарский' },
    'One city': { region: 'краснодарский', city: 'сочи' },
    'Few regions': [{ region: 'Воронежская' }, { region: 'Ростовская' }],
    'Few locations': [{ region: 'Воронежская', city: 'Воронеж' }, { region: 'Ростовская' }],
    'Different types': [{ region: 'Москва' }, { kladr_id: '50' }],
    'Location defined by different types': {
      region_fias_id: 'd00e1013-16bd-4c09-b3d5-3cb09fc54bd8',
      city: 'Сочи',
    },
    'FIAS id': { fias_id: 'd00e1013-16bd-4c09-b3d5-3cb09fc54bd8' },
    'KLADR id': { kladr_id: '6300000100000' },
  };

  if (options.value.suggestType === 'address') {
    examples = {
      ...examples,
      'Country ISO code': { country_iso_code: 'KZ' },
      'Region ISO code': { country_iso_code: 'DE', region_iso_code: 'DE-HE' },
      'Country and region': { country: 'Беларусь', region: 'Брестская' },
      'Allow any country': { country: '*' },
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
  console.info(`Suggestion enriched (${suggestion.value}), diff:`, diff);
};

const handleEnrichFail = (unrestricted_value: string) => {
  console.warn('Failed to enrich suggestion:', unrestricted_value);
};

const handleError = (error: any) => {
  console.error('VueDadata error:', error);
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

const isXl = useMediaQuery('(width >= 80rem)');
const isMd = useMediaQuery('(width >= 48rem)');

const behaviorOptionsCollapsed = ref(false);
const apiOptionsCollapsed = ref(false);
const generalOptionsCollapsed = ref(false);

onMounted(() => {
  behaviorOptionsCollapsed.value = !isXl.value;
  apiOptionsCollapsed.value = !isMd.value;
});

const builtPayload = computed(() =>
  buildPayload({ ...options.value, query: query.value } as SuggestOptions),
);
</script>

<template>
  <div class="text-slate-800">
    <header class="flex gap-3 bg-slate-50 p-3 shadow-md">
      <AButton v-if="!allOptionsDefault" class="flex gap-2" @click="resetAllOptions">
        Reset all <IconReset class="size-5" />
      </AButton>
    </header>

    <!-- Grid container -->
    <div
      class="grid grid-cols-1 grid-rows-[auto_1fr] gap-4 p-4 md:grid-cols-[20rem_1fr] xl:mx-auto xl:max-w-(--breakpoint-2xl) xl:grid-cols-[20rem_auto_20rem]"
    >
      <!-- Component behavior options -->
      <aside class="md:row-start-1 xl:col-start-1 xl:row-start-1">
        <OptionsBlock
          class="relative w-full overflow-hidden"
          :class="behaviorOptionsCollapsed && 'h-20'"
          :canReset="!allBehaviorOptionsDefault"
          :collapseOnSmallScreen="true"
          :isCollapsed="behaviorOptionsCollapsed"
          heading="Component behavior options"
          headingClass="cursor-pointer hover:text-slate-700"
          @headingClick="behaviorOptionsCollapsed = true"
          @resetClick="resetBehaviorOptions"
        >
          <div class="flex items-center gap-2">
            minChars:

            <ButtonRemove
              outline
              @click="options.minChars = Math.max(1, (options.minChars || 1) - 1)"
            />

            <input
              v-model.number="options.minChars"
              class="w-20 rounded-lg border bg-white px-1.5 py-0.5"
              min="1"
              step="1"
              type="number"
            />
            <ButtonAdd outline @click="options.minChars = (options.minChars || 0) + 1" />
          </div>

          <div class="flex items-center gap-2">
            debounce:

            <ButtonRemove
              outline
              @click="options.debounce = Math.max(0, (options.debounce || 0) - 50)"
            />

            <input
              v-model.number="options.debounce"
              class="w-20 rounded-lg border bg-white px-1.5 py-0.5"
              min="0"
              step="1"
              type="number"
            />
            <ButtonAdd outline @click="options.debounce = (options.debounce || 0) + 50" />
          </div>

          <RadioGroup
            v-model="options.showOnFocus"
            :options="SHOW_ON_FOCUS_OPTIONS"
            label="showOnFocus"
          />

          <RadioGroup
            v-model="options.clearOnChange"
            :options="CLEAR_ON_CHANGE_OPTIONS"
            label="clearOnChange"
          />

          <CheckBox v-model="options.selectOnBlur" label="selectOnBlur" />
          <CheckBox v-model="options.selectOnEnter" label="selectOnEnter" />
          <CheckBox v-model="options.enrichOnSelect" label="enrichOnSelect" />
          <CheckBox v-model="options.addSpace" label="addSpace" />
          <CheckBox v-model="options.continueSelecting" label="continueSelecting" />
          <CheckBox v-model="options.showClearButton" label="showClearButton" />
          <CheckBox v-model="options.forceShow" label="forceShow" />
          <CheckBox v-model="options.forceHide" label="forceHide" />
          <CheckBox checked disabled label="focusOnMounted" />
          <CheckBox v-model="options.disabled" label="disabled" />
          <InputText v-model="options.placeholder" label="placeholder:" />
          <InputText v-model="options.suggestionsHint" label="suggestionsHint:" />
          <InputText v-model="options.noSuggestionsHint" label="noSuggestionsHint:" />

          <div
            :class="
              behaviorOptionsCollapsed &&
              'absolute bottom-0 left-0 h-full w-full cursor-pointer rounded-[inherit] bg-gradient-to-t from-slate-50 to-75% hover:contrast-125'
            "
            @click="behaviorOptionsCollapsed = false"
          />
        </OptionsBlock>
      </aside>

      <!-- API requests options -->
      <aside class="md:col-start-1 md:row-start-2 xl:col-start-3 xl:row-start-1">
        <OptionsBlock
          class="relative w-full overflow-hidden"
          :class="apiOptionsCollapsed && 'h-20'"
          :canReset="!allApiOptionsDefault"
          heading="API requests options"
          headingClass="cursor-pointer hover:text-slate-700"
          @headingClick="apiOptionsCollapsed = true"
          @resetClick="resetApiOptions"
        >
          <div class="flex items-center gap-2">
            count:
            <input
              v-model.number="options.count"
              class="accent-accent"
              :max="MAX_SUG_COUNT"
              min="1"
              step="1"
              type="range"
            />
            {{ options.count }}
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
                label="locationsBoost:"
                placeholder="kladr_id or ids"
              />
              {{ options.locationsBoost }}
            </div>

            <!-- example locations filters -->
            <div v-if="options.suggestType === 'address' || options.suggestType === 'fias'">
              <div>
                locationsFilter examples:
                <AButton class="text-sm" @click="examplesShown = !examplesShown">
                  {{ examplesShown ? 'Hide' : 'Show' }}
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
              :suggestType="options.suggestType || DEFAULT_OPTIONS.suggestType"
            />
          </template>

          <!-- 'address' and 'fias' -->
          <template v-if="options.suggestType === 'address' || options.suggestType === 'fias'">
            <div class="flex flex-wrap gap-3">
              <SelectOptions
                v-model="options.fromBound"
                :options="
                  options.suggestType === 'address'
                    ? BOUND_TYPES
                    : BOUND_TYPES.filter((el) => el !== 'country')
                "
                label="fromBound:"
              />
              <SelectOptions
                v-model="options.toBound"
                :options="
                  options.suggestType === 'address'
                    ? BOUND_TYPES
                    : BOUND_TYPES.filter((el) => el !== 'country')
                "
                label="toBound:"
              />
            </div>
          </template>

          <template v-if="options.suggestType === 'address'">
            <RadiusFilter v-model="options.radiusFilter" />

            <RadioGroup v-model="options.division" :options="DIVISION_TYPES" label="division" />

            <RadioGroup v-model="options.language" :options="LANGUAGES" label="language:" />
          </template>

          <CheckBox
            v-if="
              options.locationsFilter &&
              (options.suggestType === 'address' || options.suggestType === 'fias')
            "
            v-model="options.restrictValue"
            label="restrictValue"
          />

          <RadioGroup
            v-if="options.suggestType === 'party'"
            v-model="options.entityType"
            :options="[undefined, ...PARTY_TYPES]"
            label="entityType:"
          />
          <TogglesGroup
            v-else-if="options.suggestType === 'party_by'"
            v-model="options.entityType"
            :options="[/* undefined, */ ...PARTY_BY_TYPES]"
            label="entityType:"
          />
          <TogglesGroup
            v-else-if="options.suggestType === 'party_kz'"
            v-model="options.entityType"
            :options="[/* undefined, */ ...PARTY_KZ_TYPES]"
            label="entityType:"
          />
          <TogglesGroup
            v-else-if="options.suggestType === 'bank'"
            v-model="options.entityType"
            :options="BANK_TYPES"
            label="entityType: "
          />

          <TogglesGroup
            v-if="
              options.suggestType === 'party' ||
              options.suggestType === 'party_by' ||
              options.suggestType === 'bank'
            "
            v-model="options.entityStatus"
            :options="
              { party: PARTY_STATUSES, party_by: PARTY_BY_STATUSES, bank: BANK_STATUSES }[
                options.suggestType
              ]
            "
            label="entityStatus:"
          />

          <!-- 'fio' -->
          <template v-if="options.suggestType === 'fio'">
            <TogglesGroup v-model="options.fioParts" :options="FIO_PARTS" label="fioParts:" />

            <RadioGroup
              v-model="options.fioGender"
              :options="[undefined, ...FIO_GENDERS]"
              label="fioGender:"
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
            allowArray
            label="filters (json)"
            placeholder="'filters' API request parameter"
          />

          <div
            :class="
              apiOptionsCollapsed &&
              'absolute bottom-0 left-0 h-full w-full cursor-pointer rounded-[inherit] bg-gradient-to-t from-slate-50 to-75% hover:contrast-125'
            "
            @click="apiOptionsCollapsed = false"
          />
        </OptionsBlock>
      </aside>

      <!-- General options and the input -->
      <main
        class="flex w-full min-w-0 flex-col gap-3 md:col-start-2 md:row-span-2 md:row-start-1 xl:col-start-2 xl:row-start-1 xl:mx-auto xl:max-w-5xl"
      >
        <!-- Block above the input -->
        <OptionsBlock
          class="relative w-full overflow-hidden pb-3"
          :class="generalOptionsCollapsed && 'h-20'"
          :canReset="!allGeneralOptionsDefault"
          heading="General options"
          headingClass="cursor-pointer hover:text-slate-700"
          @headingClick="generalOptionsCollapsed = true"
          @resetClick="resetGeneralOptions"
        >
          <div class="flex flex-col gap-4">
            <!-- API token & URL -->
            <div class="flex flex-wrap gap-2">
              <InputText
                v-model.trim="tokenModel"
                class="grow"
                :placeholder="TOKEN_PLACEHOLDER"
                label="API token:"
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
                :options="ORDERED_SUGGEST_TYPES"
                buttonClass="px-3 py-1.5"
              />
            </div>

            <!-- Custom payload & headers -->
            <div class="flex flex-wrap items-start gap-x-3 gap-y-2">
              <div class="grow basis-1/3">
                <!-- Custom payload -->
                <div class="flex gap-2">
                  <ButtonAdd v-if="!showCustomPayload" @click="showCustomPayload = true" />
                  <ButtonRemove v-else outline @click="removeCustomPayload()" />
                  <span>
                    {{ showCustomPayload ? 'Remove custom payload' : 'Add custom payload...' }}
                  </span>
                </div>

                <InputJson
                  v-if="showCustomPayload"
                  v-model.lazy="options.payload"
                  class="w-full"
                  :rows="4"
                  placeholder="Custom payload for the API request. Any fields specified here will be added to the final request payload, or override existing values if already set."
                />
              </div>

              <div class="grow basis-1/3">
                <!-- Custom headers -->
                <div class="flex gap-2">
                  <ButtonAdd v-if="!showCustomHeaders" @click="showCustomHeaders = true" />
                  <ButtonRemove v-else outline @click="removeCustomHeaders()" />
                  <span>
                    {{ showCustomHeaders ? 'Remove custom headers' : 'Add custom headers...' }}
                  </span>
                </div>

                <InputJson
                  v-if="showCustomHeaders"
                  v-model.lazy="options.headers"
                  class="w-full"
                  :rows="4"
                  placeholder="Custom headers for the API request. Any headers specified here will be added to the final request headers, or override existing values if already set."
                />
              </div>

              <CheckBox v-model="options.httpCache" class="gap-2" label="httpCache" />
            </div>
          </div>

          <div
            :class="
              generalOptionsCollapsed &&
              'absolute bottom-0 left-0 h-full w-full cursor-pointer rounded-[inherit] bg-gradient-to-t from-slate-50 to-75% hover:contrast-125'
            "
            @click="generalOptionsCollapsed = false"
          />
        </OptionsBlock>

        <div class="flex flex-wrap items-center gap-3">
          <CheckBox v-model="showLiveSnippet" label="Show live snippet" />
          <CheckBox v-model="showAllOptions" label="Show all options" />
          <CheckBox v-model="showBuiltPayload" label="Show payload" />
        </div>

        <div v-if="showLiveSnippet">
          <LiveSnippet :nonDefaultOptions :options :showToken="isTokenProvided" />
        </div>

        <pre
          v-if="showAllOptions"
          class="rounded-xl bg-white px-4 py-2 text-[14px]"
        ><b>Current options: </b> {{ isTokenProvided ? options : {...options, token: TOKEN_PLACEHOLDER} }}</pre>

        <pre
          v-if="showBuiltPayload"
          class="rounded-xl bg-white px-4 py-2 text-[14px]"
        ><b>Final payload: </b>{{ builtPayload }}</pre>

        <!-- Current query string -->
        <div :class="nowrapQuery && 'overflow-hidden text-ellipsis whitespace-nowrap'">
          <span :class="!query && 'text-slate-400'"> Current query: </span>

          <b @click="noSelectionClick(() => (nowrapQuery = !nowrapQuery))">
            {{ query }}
          </b>
        </div>

        <!-- Component Exposed API -->
        <div>
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
            :disabled="!vueDadataRef?.suggestionsList?.length || vueDadataRef?.isDropdownVisible"
            @mousedown.prevent="vueDadataRef?.show()"
            >show</AButton
          >
          <AButton
            :disabled="!vueDadataRef?.suggestionsList?.length || !vueDadataRef?.isDropdownVisible"
            @mousedown.prevent="vueDadataRef?.hide()"
            >hide</AButton
          >
        </div>

        <h2 class="text-5xl leading-relaxed font-semibold">Try here:</h2>

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

        <div class="rounded-xl bg-white px-4 py-2">
          <div class="flex justify-between">
            <span>
              Current suggestion:
              <span v-if="!suggestion" class="text-slate-500">{{ typeof suggestion }}</span>
            </span>
            <AButton v-if="suggestion" @click="clearSuggestion">Clear</AButton>
          </div>

          <pre
            v-if="suggestion"
            class="text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap text-slate-950"
            >{{ suggestion }}</pre
          >
        </div>
      </main>
    </div>
  </div>
</template>
