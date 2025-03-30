<script lang="ts" setup>
import { computed, ref } from 'vue';
import AButton from './components/AButton.vue';
import CheckBox from './components/CheckBox.vue';
import InputText from './components/InputText.vue';
import LocationsFilter from './components/LocationsFilter.vue';
import RadioGroup from './components/RadioGroup.vue';
import TogglesGroup from './components/TogglesGroup.vue';
import RadiusFilter from './components/RadiusFilter.vue';
import SelectOptions from './components/SelectOptions.vue';
import LiveSnippet from './components/LiveSnippet.vue';
import VueDadata from '@/VueDadata.vue';
import {
  BASE_SUGGEST_URL,
  BOUND_TYPES,
  DIVISION_TYPES,
  LANGUAGES,
  MAX_SUG_COUNT,
  SHOW_ON_FOCUS_OPTIONS,
  SUGGEST_TYPES,
  PARTY_TYPES,
  PARTY_STATUSES,
  BANK_TYPES,
  BANK_STATUSES,
  FIO_PARTS,
  FIO_GENDERS,
  type AddressSuggestion,
  DEFAULT_OPTIONS,
  type VueDadataOptions,
} from '@/index';

const isTailwindEnabled = ref(true);
const showLiveSnippet = ref(true); // @todo temp
const showAllOptions = ref(false);

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

// API Token
const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;
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

const query = ref('');
const suggestion = ref<AddressSuggestion | undefined>(undefined);

const reset = () => {
  query.value = '';
  suggestion.value = undefined;
};

const defaultOptions = ref<VueDadataOptions>({
  ...DEFAULT_OPTIONS,
  token: envToken,
  placeholder: 'Start typing...',
});

const options = ref<VueDadataOptions>(JSON.parse(JSON.stringify(defaultOptions.value)));

const handleEnriched = (suggestion: AddressSuggestion) => {
  console.info('Suggestion enriched:', suggestion);
};

const handleEnrichFail = (unrestricted_value: string) => {
  console.warn('Failed to enrich suggestion:', unrestricted_value);
};

const handleError = (error: any) => {
  console.error('VueDadata error:', error);
};

const nowrapQuery = ref(true);
const examplesShown = ref(false);
</script>

<template>
  <div class="px-2">
    <!-- <div class="flex">
      <pre>defaultOptions: {{ defaultOptions }}</pre>
      <pre>options: {{ options }}</pre>
    </div> -->

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
            <h3 class="font-semibold">API requests options</h3>

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

            <RadioGroup
              v-model="options.suggestType"
              class="flex gap-2"
              :options="SUGGEST_TYPES"
              label="suggestType"
            />

            <template v-if="options.suggestType !== 'fio' && options.suggestType !== 'email'">
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

            <template v-if="options.suggestType === 'bank' || options.suggestType === 'party'">
              <TogglesGroup
                v-model="options.entityStatus"
                class="flex gap-2"
                :options="options.suggestType === 'party' ? PARTY_STATUSES : BANK_STATUSES"
                label="entityStatus:"
              />

              <RadioGroup
                v-if="options.suggestType === 'party'"
                v-model="options.partyType"
                class="flex gap-2"
                :options="[undefined, ...PARTY_TYPES]"
                label="partyType:"
              />

              <TogglesGroup
                v-if="options.suggestType === 'bank'"
                v-model="options.bankType"
                class="flex gap-2"
                :options="BANK_TYPES"
                label="bankType: "
              />
            </template>

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
            <CheckBox v-model="options.clearOnChange" label="clearOnChange" />
            <CheckBox v-model="options.addSpace" label="addSpace" />
            <CheckBox v-model="options.continueSelecting" label="continueSelecting" />
            <CheckBox v-model="options.showClearButton" label="showClearButton" />
            <InputText v-model="options.placeholder" label="placeholder:" />
          </div>
        </div>

        <CheckBox v-model="showLiveSnippet" label="Show live snippet" />

        <div v-if="showLiveSnippet">
          <LiveSnippet :defaultOptions="DEFAULT_OPTIONS" :options :showToken="isTokenProvided" />
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
        v-bind:="options"
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
            <AButton v-if="suggestion" @click="reset">Reset</AButton>
          </div>

          <pre v-if="suggestion" class="text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap">{{
            suggestion
          }}</pre>
        </div>
      </section>
    </main>
  </div>
</template>
