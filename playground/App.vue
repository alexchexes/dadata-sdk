<script lang="ts" setup>
import { computed, ref } from 'vue';
import AButton from './components/AButton.vue';
import CheckBox from './components/CheckBox.vue';
import InputText from './components/InputText.vue';
import LocationsFilter from './components/LocationsFilter.vue';
import RadioGroup from './components/RadioGroup.vue';
import RadiusFilter from './components/RadiusFilter.vue';
import SelectOptions from './components/SelectOptions.vue';
import type { VueDadataProps } from '@/VueDadata.vue';
import VueDadata from '@/VueDadata.vue';
import {
  BASE_SUGGEST_URL,
  BOUND_TYPES,
  DEFAULT_COUNT,
  DEFAULT_DIVISION,
  DEFAULT_SUGGEST_TYPE,
  DIVISION_TYPES,
  LANGUAGES,
  MAX_SUG_COUNT,
  DEFAULT_SHOW_ON_FOCUS,
  SHOW_ON_FOCUS_OPTIONS,
  SUGGEST_TYPES,
  type AddressSuggestion,
} from '@/index';

const isTailwindEnabled = ref(true);

function toggleTailwind() {
  const tailwindLink = document.getElementById('tailwind-styles') as HTMLLinkElement;
  if (!tailwindLink) return;
  // Toggle the href attribute between the two files
  tailwindLink.href = isTailwindEnabled.value
    ? './playground.no-tailwind.css'
    : './playground.tailwind.css';
  isTailwindEnabled.value = !isTailwindEnabled.value;
}

// API Token
const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;
const tokenModel = computed({
  get: () => (options.value.token === envToken ? '' : options.value.token),
  set: (val) => (options.value.token = val.trim() ? val.trim() : envToken),
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
const locationsExamples = ref({
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
  'Country ISO code': { country_iso_code: 'KZ' },
  'Region ISO code': { country_iso_code: 'DE', region_iso_code: 'DE-HE' },
  'Country and region': { country: 'Беларусь', region: 'Брестская' },
  'Allow any country': { country: '*' },
});

const query = ref('');
const suggestion = ref<AddressSuggestion | undefined>(undefined);

const reset = () => {
  query.value = '';
  suggestion.value = undefined;
};

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
type EditableOptions = Mutable<
  Pick<
    VueDadataProps,
    | 'token'
    | 'url'
    | 'showOnFocus'
    | 'selectOnBlur'
    | 'selectOnEnter'
    | 'disabled'
    | 'count'
    | 'suggestType'
    | 'division'
    | 'highlightOptions'
    | 'placeholder'
    | 'enrichOnSelect'
    | 'clearSuggestionOnChange'
    | 'addSpace'
    | 'continueSelecting'
    | 'showClearButton'
    | 'fromBound'
    | 'toBound'
    | 'locationsFilter'
    | 'radiusFilter'
    | 'restrictValue'
    | 'locationsBoost'
    | 'language'
  >
>;

const options = ref<EditableOptions>({
  token: envToken,
  highlightOptions: {
    highlightTag: 'span',
  },
  disabled: false,
  url: undefined,
  placeholder: 'Start typing...',
  count: DEFAULT_COUNT,
  suggestType: DEFAULT_SUGGEST_TYPE,
  division: DEFAULT_DIVISION,
  showOnFocus: DEFAULT_SHOW_ON_FOCUS,
  selectOnBlur: false,
  selectOnEnter: true,
  enrichOnSelect: true,
  clearSuggestionOnChange: true,
  addSpace: true,
  continueSelecting: false,
  showClearButton: false,
  fromBound: undefined,
  toBound: undefined,
  locationsFilter: undefined,
  radiusFilter: undefined,
  restrictValue: false,
  locationsBoost: undefined,
  language: 'ru',
});

const handleEnriched = (suggestion: AddressSuggestion) => {
  console.info('suggestion enriched: ', suggestion);
};

const nowrapQuery = ref(true);
const examplesShown = ref(false);
</script>

<template>
  <div>
    <AButton class="mt-1 ml-1" @click="toggleTailwind">
      Tailwind is {{ isTailwindEnabled ? 'ON' : 'OFF' }}
    </AButton>

    <main class="mx-auto max-w-3xl py-12">
      <!-- Block above the input -->
      <div class="flex flex-col gap-2">
        <!-- Options -->
        <div class="flex flex-wrap gap-3">
          <!-- API requests options -->
          <div class="flex min-w-xs grow basis-[40%] flex-col gap-2 rounded-xl border px-3 py-2">
            <h3 class="font-semibold">API requests options</h3>

            <InputText
              v-model.trim="tokenModel"
              label="API token:"
              placeholder="***************************"
            />

            <InputText
              v-model.trim="options.url"
              :placeholder="BASE_SUGGEST_URL + DEFAULT_SUGGEST_TYPE"
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

            <RadioGroup
              v-model="options.suggestType"
              class="flex gap-2"
              :options="SUGGEST_TYPES"
              label="suggestType"
            />

            <RadioGroup
              v-model="options.division"
              class="flex gap-2"
              :options="DIVISION_TYPES"
              label="division"
            />

            <div class="dev-item">
              <InputText v-model="locationsBoostModel" label="locationsBoost (kladr_id's):" />
              {{ options.locationsBoost }}
            </div>

            <div class="flex flex-wrap gap-3">
              <SelectOptions
                v-model="options.fromBound"
                :options="BOUND_TYPES"
                label="fromBound:"
              />
              <SelectOptions v-model="options.toBound" :options="BOUND_TYPES" label="toBound:" />
            </div>

            <div>
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

            <LocationsFilter v-model="options.locationsFilter" />

            <RadiusFilter v-model="options.radiusFilter" />

            <CheckBox v-model="options.restrictValue" label="restrictValue" />

            <RadioGroup
              v-model="options.language"
              class="flex gap-2"
              :options="LANGUAGES"
              label="language"
            />
          </div>

          <!-- Component behavior options -->
          <div class="flex min-w-xs grow basis-[40%] flex-col gap-2 rounded-xl border px-3 py-2">
            <h3 class="font-semibold">Component behavior options</h3>

            <CheckBox v-model="options.disabled" label="disabled" />

            <RadioGroup
              v-model="options.showOnFocus"
              class="flex gap-2"
              :options="SHOW_ON_FOCUS_OPTIONS"
              label="showOnFocus"
            />

            <CheckBox v-model="options.selectOnBlur" label="selectOnBlur" />
            <CheckBox v-model="options.selectOnEnter" label="selectOnEnter" />
            <CheckBox v-model="options.enrichOnSelect" label="enrichOnSelect" />
            <CheckBox v-model="options.clearSuggestionOnChange" label="clearSuggestionOnChange" />
            <CheckBox v-model="options.addSpace" label="addSpace" />
            <CheckBox v-model="options.continueSelecting" label="continueSelecting" />
            <CheckBox v-model="options.showClearButton" label="showClearButton" />
            <InputText v-model="options.placeholder" label="placeholder:" />
          </div>
        </div>

        <!-- Current query string -->
        <div :class="nowrapQuery && 'ellipsis-nowrap'">
          query: <b @click="nowrapQuery = !nowrapQuery">{{ query }}</b>
        </div>
      </div>

      <VueDadata
        v-model="query"
        v-model:suggestion="suggestion"
        v-bind:="options"
        @enriched="handleEnriched"
      />

      <section class="mt-3 min-h-[1000px]">
        <div class="rounded-xl bg-white px-4 py-2">
          <div class="flex justify-between">
            <span>
              Current suggestion:
              <span v-if="!suggestion" class="text-slate-500">{{ typeof suggestion }}</span>
            </span>
            <AButton v-if="suggestion" @click="reset">Reset</AButton>
          </div>

          <pre v-if="suggestion" class="text-[14px] whitespace-pre-wrap">{{ suggestion }}</pre>
        </div>
      </section>
    </main>
  </div>
</template>
