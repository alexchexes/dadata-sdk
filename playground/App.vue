<script lang="ts" setup>
import { computed, ref, type Ref } from 'vue';
import AButton from './components/AButton.vue';
import CheckBox from './components/CheckBox.vue';
import InputText from './components/InputText.vue';
import LocationsFilter from './components/LocationsFilter.vue';
import RadioGroup from './components/RadioGroup.vue';
import TogglesGroup from './components/TogglesGroup.vue';
import RadiusFilter from './components/RadiusFilter.vue';
import SelectOptions from './components/SelectOptions.vue';
import LiveSnippet from './components/LiveSnippet.vue';
import ButtonReset from './components/ButtonReset.vue';
import VueDadata from '@/VueDadata.vue';
import {
  BANK_STATUSES,
  BANK_TYPES,
  BASE_SUGGEST_URL,
  BOUND_TYPES,
  DEFAULT_OPTIONS,
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
  SHOW_ON_FOCUS_OPTIONS,
  SUGGEST_TYPES,
  type VueDadataOptions,
} from '@/index';
import type { DadataSuggestion } from '@/types/api';
import { ignorableWatch } from '@vueuse/core';
import ButtonAdd from './components/ButtonAdd.vue';
import InputJson from './components/InputJson.vue';
import ButtonRemove from './components/ButtonRemove.vue';
import { useSyncUrlParams } from './composables/useSyncUrlParams.ts';

// API Token
const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;

const isTailwindEnabled = ref(true);
const showLiveSnippet = ref(true); // @todo temp
const showAllOptions = ref(false);

const query = ref('');
const suggestion = ref<DadataSuggestion | undefined>(undefined);
const suggestionsList = ref<DadataSuggestion[] | undefined>(undefined);

const nowrapQuery = ref(true);
const examplesShown = ref(false);

const defaultOptions = computed<VueDadataOptions>(() => ({
  ...DEFAULT_OPTIONS,
  token: envToken,
  placeholder: 'Start typing...',
}));

const options = ref<VueDadataOptions>(JSON.parse(JSON.stringify(defaultOptions.value)));

const getDiff = (defaults: Record<string, any>, current: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(current).filter(([key, val]) => {
      const def = (defaults as Partial<VueDadataOptions>)[key as keyof VueDadataOptions];
      if (val === def) {
        return false;
      }
      if (typeof def === 'undefined' && typeof val === 'string' && !val) {
        return false;
      }
      return true;
    }),
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

function toggleTailwind() {
  const tailwindLink = document.getElementById('tailwind-styles') as HTMLLinkElement;
  if (!tailwindLink) return;
  // Toggle the href attribute between the two files
  tailwindLink.href = isTailwindEnabled.value
    ? './playground.no-tailwind.css'
    : './playground.tailwind.css';
  isTailwindEnabled.value = !isTailwindEnabled.value;
}

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
  'token',
  'url',
  'httpCache',
  'count',
  'suggestType',
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

const allApiOptionsDefault = computed(
  () => !apiOptionsKeys.find((key) => options.value[key] !== defaultOptions.value[key]),
);

const allComponentOptionsDefault = computed(
  () =>
    !Object.keys(options.value)
      .filter((key) => !apiOptionsKeys.includes(key as keyof VueDadataOptions))
      .find(
        (key) =>
          options.value[key as keyof VueDadataOptions] !==
          defaultOptions.value[key as keyof VueDadataOptions],
      ),
);

const resetComponentOptions = () => {
  Object.keys(options.value).forEach((key) => {
    if (!apiOptionsKeys.includes(key as keyof VueDadataOptions)) {
      // @ts-ignore @ts-fuckyourself
      options.value[key] = defaultOptions.value[key];
    }
  });
};

const resetApiOptions = () => {
  apiOptionsKeys.forEach((key) => {
    // @ts-ignore @ts-fuckyourself
    options.value[key] = defaultOptions.value[key];
  });
  showCustomHeaders.value = false;
  showCustomPayload.value = false;
  locationsBoostString.value = '';
};

const resetSuggestions = () => {
  query.value = '';
  suggestion.value = undefined;
};

const handleEnriched = (suggestion: DadataSuggestion) => {
  console.info('Suggestion enriched:', suggestion);
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
</script>

<template>
  <div class="px-2">
    <AButton class="mt-1 ml-1" @click="toggleTailwind">
      Tailwind is {{ isTailwindEnabled ? 'ON' : 'OFF' }}
    </AButton>

    <main class="mx-auto max-w-3xl py-12">
      <!-- Block above the input -->
      <div class="flex flex-col gap-2 pb-2">
        <!-- Options -->
        <div class="flex flex-wrap gap-3">
          <!-- API requests options -->
          <div class="flex min-w-xs grow basis-[40%] flex-col gap-2 rounded-xl border px-3 py-2">
            <div class="flex gap-2">
              <h3 class="font-semibold">API requests options</h3>
              <ButtonReset
                v-if="!allApiOptionsDefault"
                title="Reset API requests options"
                @click="resetApiOptions"
              />
            </div>

            <InputText
              v-model.trim="tokenModel"
              :placeholder="TOKEN_PLACEHOLDER"
              label="API token:"
            />

            <InputText
              v-model.trim="options.url"
              :placeholder="BASE_SUGGEST_URL + options.suggestType"
              label="API URL:"
            />

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

            <div class="flex flex-wrap gap-1">
              suggestType:
              <RadioGroup
                v-model="options.suggestType"
                class="flex gap-2"
                :options="SUGGEST_TYPES"
              />
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
                <InputText v-model="locationsBoostModel" label="locationsBoost (kladr_id's):" />
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

              <RadioGroup
                v-model="options.division"
                class="flex gap-2"
                :options="DIVISION_TYPES"
                label="division"
              />

              <RadioGroup
                v-model="options.language"
                class="flex gap-2"
                :options="LANGUAGES"
                label="language:"
              />
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
              class="flex gap-2"
              :options="[undefined, ...PARTY_TYPES]"
              label="entityType:"
            />
            <TogglesGroup
              v-else-if="options.suggestType === 'party_by'"
              v-model="options.entityType"
              class="flex gap-2"
              :options="[/* undefined, */ ...PARTY_BY_TYPES]"
              label="entityType:"
            />
            <TogglesGroup
              v-else-if="options.suggestType === 'party_kz'"
              v-model="options.entityType"
              class="flex gap-2"
              :options="[/* undefined, */ ...PARTY_KZ_TYPES]"
              label="entityType:"
            />
            <TogglesGroup
              v-else-if="options.suggestType === 'bank'"
              v-model="options.entityType"
              class="flex gap-2"
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
              class="flex gap-2"
              :options="
                { party: PARTY_STATUSES, party_by: PARTY_BY_STATUSES, bank: BANK_STATUSES }[
                  options.suggestType
                ]
              "
              label="entityStatus:"
            />

            <!-- 'fio' -->
            <template v-if="options.suggestType === 'fio'">
              <TogglesGroup
                v-model="options.fioParts"
                class="flex gap-2"
                :options="FIO_PARTS"
                label="fioParts:"
              />

              <RadioGroup
                v-model="options.fioGender"
                class="flex gap-2"
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
              allowArray
              label="filters (json)"
              placeholder="'filters' API request parameter"
            />

            <!-- Custom payload -->
            <div class="flex gap-2">
              <span
                >{{ showCustomPayload ? 'Remove custom payload' : 'Add custom payload...' }}
              </span>
              <ButtonAdd v-if="!showCustomPayload" @click="showCustomPayload = true" />
              <ButtonRemove v-else outline @click="removeCustomPayload()" />
            </div>
            <InputJson
              v-if="showCustomPayload"
              v-model="options.payload"
              :rows="4"
              placeholder="Custom payload for the API request. Any fields specified here will be added to the final request payload, or override existing values if already set."
            />

            <!-- Custom headers -->
            <div class="flex gap-2">
              <span
                >{{ showCustomHeaders ? 'Remove custom headers' : 'Add custom headers...' }}
              </span>
              <ButtonAdd v-if="!showCustomHeaders" @click="showCustomHeaders = true" />
              <ButtonRemove v-else outline @click="removeCustomHeaders()" />
            </div>
            <InputJson
              v-if="showCustomHeaders"
              v-model="options.headers"
              :rows="4"
              placeholder="Custom headers for the API request. Any headers specified here will be added to the final request headers, or override existing values if already set."
            />
          </div>

          <!-- Component behavior options -->
          <div class="flex min-w-xs grow basis-[40%] flex-col gap-2 rounded-xl border px-3 py-2">
            <div class="flex gap-2">
              <h3 class="font-semibold">Component behavior options</h3>
              <ButtonReset
                v-if="!allComponentOptionsDefault"
                title="Reset Component behavior options"
                @click="resetComponentOptions"
              />
            </div>

            <CheckBox v-model="options.disabled" label="disabled" />

            <RadioGroup
              v-model="options.showOnFocus"
              class="flex gap-2"
              :options="SHOW_ON_FOCUS_OPTIONS"
              label="showOnFocus"
            />

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

            <CheckBox v-model="options.selectOnBlur" label="selectOnBlur" />
            <CheckBox v-model="options.selectOnEnter" label="selectOnEnter" />
            <CheckBox v-model="options.enrichOnSelect" label="enrichOnSelect" />
            <CheckBox v-model="options.clearOnChange" label="clearOnChange" />
            <CheckBox v-model="options.addSpace" label="addSpace" />
            <CheckBox v-model="options.continueSelecting" label="continueSelecting" />
            <CheckBox v-model="options.showClearButton" label="showClearButton" />
            <CheckBox v-model="options.forceShow" label="forceShow" />
            <CheckBox v-model="options.forceHide" label="forceHide" />
            <CheckBox checked disabled label="focusOnMounted" />
            <InputText v-model="options.placeholder" label="placeholder:" />
            <InputText v-model="options.suggestionsHint" label="suggestionsHint:" />
            <InputText v-model="options.noSuggestionsHint" label="noSuggestionsHint:" />
          </div>
        </div>

        <CheckBox v-model="showLiveSnippet" label="Show live snippet" />

        <div v-if="showLiveSnippet">
          <LiveSnippet :nonDefaultOptions :options :showToken="isTokenProvided" />
        </div>

        <CheckBox v-model="showAllOptions" label="Show all current options" />

        <pre
          v-if="showAllOptions"
          class="rounded-xl bg-white px-4 py-2 text-[14px]"
        ><b>Current options: </b> {{ isTokenProvided ? options : {...options, token: TOKEN_PLACEHOLDER} }}</pre>

        <!-- Current query string -->
        <div :class="nowrapQuery && 'ellipsis-nowrap'">
          query: <b @click="nowrapQuery = !nowrapQuery">{{ query }}</b>
        </div>
      </div>

      <VueDadata
        v-model="query"
        v-model:suggestion="suggestion"
        v-model:suggestionsList="suggestionsList"
        :focusOnMounted="true"
        :token="options.token"
        v-bind="nonDefaultOptions"
        @enriched="handleEnriched"
        @enrichFail="handleEnrichFail"
        @error="handleError"
      />

      <section class="mt-3 min-h-[1000px]">
        <div class="rounded-xl bg-white px-4 py-2">
          <div class="flex justify-between">
            <span>
              Current suggestion:
              <span v-if="!suggestion" class="text-slate-500">{{ typeof suggestion }}</span>
            </span>
            <AButton v-if="suggestion" @click="resetSuggestions">Reset</AButton>
          </div>

          <pre v-if="suggestion" class="text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap">{{
            suggestion
          }}</pre>
        </div>
      </section>
    </main>
  </div>
</template>
