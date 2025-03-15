<script lang="ts" setup>
import { computed, ref } from 'vue';
import VueDadata from './VueDadata.vue';
import type { VueDadataProps } from './VueDadata.vue';
import type { AddressSuggestion } from './types';
import { BOUNDS, DEFAULT_COUNT, MAX_SUG_COUNT } from './const';

// API Token
const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;
const userProvidedToken = ref<string | undefined>();
const usedToken = computed(() => userProvidedToken.value || envToken);
const visibleToken = computed({
  get: () => userProvidedToken.value || '',
  set: (val) => (userProvidedToken.value = val),
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
const locationsExamples = {
  no: undefined,
  oneRegion: { region: 'краснодарский' },
  oneCity: { region: 'краснодарский', city: 'сочи' },
  fewRegions: [{ region: 'Воронежская' }, { region: 'Ростовская' }],
  fewLocations: [{ region: 'Воронежская', city: 'Воронеж' }, { region: 'Ростовская' }],
  diffenetTypes: [{ region: 'Москва' }, { kladr_id: '50' }],
  diffenetTypesOneObject: { region_fias_id: 'd00e1013-16bd-4c09-b3d5-3cb09fc54bd8', city: 'Сочи' },
  fias_id: { fias_id: 'd00e1013-16bd-4c09-b3d5-3cb09fc54bd8' },
  kladr_id: { kladr_id: '6300000100000' },
  country_iso_code: { country_iso_code: 'KZ' },
  region_iso_code: { country_iso_code: 'DE', region_iso_code: 'DE-HE' },
  countryAndRegion: { country: 'Беларусь', region: 'Брестская' },
  allowAnyCountry: { country: '*' },
};

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
    | 'selectOnBlur'
    | 'selectOnEnter'
    | 'disabled'
    | 'count'
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
    | 'restrictValue'
    | 'locationsBoost'
    | 'language'
  >
>;

const options = ref<EditableOptions>({
  highlightOptions: {
    highlightTag: 'span',
  },
  disabled: false,
  placeholder: 'Start typing...',
  count: DEFAULT_COUNT,
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
  restrictValue: false,
  locationsBoost: undefined,
  language: 'ru',
});

const handleEnriched = (suggestion: AddressSuggestion) => {
  console.info('suggestion enriched: ', suggestion);
};

const nowrapQuery = ref(true);
</script>

<template>
  <main>
    <div class="dev">
      <div class="dev-item">
        token:
        <input v-model.trim="visibleToken" placeholder="***************************" type="text" />
      </div>

      <label class="dev-item">
        disabled: <input v-model="options.disabled" type="checkbox" />
      </label>

      <div class="dev-item">
        placeholder: <input v-model.trim="options.placeholder" type="text" />
      </div>

      <div class="dev-item">
        count:
        <input v-model.number="options.count" :max="MAX_SUG_COUNT" min="1" step="1" type="range" />
        {{ options.count }}
      </div>

      <label class="dev-item">
        selectOnBlur: <input v-model="options.selectOnBlur" type="checkbox" />
      </label>

      <label class="dev-item">
        selectOnEnter: <input v-model="options.selectOnEnter" type="checkbox" />
      </label>

      <label class="dev-item">
        enrichOnSelect: <input v-model="options.enrichOnSelect" type="checkbox" />
      </label>

      <label class="dev-item">
        clearSuggestionOnChange: <input v-model="options.clearSuggestionOnChange" type="checkbox" />
      </label>

      <label class="dev-item">
        addSpace: <input v-model="options.addSpace" type="checkbox" />
      </label>

      <label class="dev-item">
        continueSelecting: <input v-model="options.continueSelecting" type="checkbox" />
      </label>

      <label class="dev-item">
        showClearButton: <input v-model="options.showClearButton" type="checkbox" />
      </label>

      <div>
        fromBound:
        <select v-model="options.fromBound">
          <option :value="undefined"></option>
          <option v-for="boundType in BOUNDS" :key="boundType" :value="boundType">
            {{ boundType }}
          </option>
        </select>
      </div>

      <div>
        toBound:
        <select v-model="options.toBound">
          <option :value="undefined"></option>
          <option v-for="boundType in BOUNDS" :key="boundType" :value="boundType">
            {{ boundType }}
          </option>
        </select>
      </div>

      <div class="dev-item">
        locationsFilter:
        <label v-for="(locationObj, exampleName) in locationsExamples" :key="exampleName">
          <input v-model="options.locationsFilter" :value="locationObj" type="radio" />
          {{ exampleName }}
        </label>
      </div>
      <div v-if="options.locationsFilter">{{ options.locationsFilter }}</div>

      <label class="dev-item">
        restrictValue: <input v-model="options.restrictValue" type="checkbox" />
      </label>

      <div class="dev-item">
        locationsBoost (kladr_id's): <input v-model="locationsBoostModel" type="text" />
        {{ options.locationsBoost }}
      </div>

      <div class="dev-item">
        language:
        <label>
          <input v-model="options.language" :value="'ru'" type="radio" />
          RU
        </label>
        <label>
          <input v-model="options.language" :value="'en'" type="radio" />
          EN
        </label>
      </div>

      <div :class="nowrapQuery && 'ellipsis-nowrap'">
        query: <b @click="nowrapQuery = !nowrapQuery">{{ query }}</b>
      </div>
    </div>

    <VueDadata
      v-model="query"
      v-model:suggestion="suggestion"
      :token="usedToken"
      v-bind:="options"
      @enriched="handleEnriched"
    />

    <section class="dev">
      <div class="selected-sug-wrapper">
        Current suggestion:
        <div v-if="suggestion">
          <button @click="reset">Reset</button>

          <pre>{{ suggestion }}</pre>
        </div>
        <span v-else>{{ typeof suggestion }}</span>
      </div>
    </section>
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
  background-color: #e9ebef;
  font-size: 16px;
}

main {
  max-width: 700px;
  margin: 0 auto;
  padding: 48px 16px 200px;
}

.dev section {
  margin-top: 10px;
  border-radius: 4px;
  background-color: #fff;
  padding: 10px 20px;
}

.dev pre {
  white-space: pre-wrap;
  font-size: 14px;
}

.dev {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.dev-item {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: fit-content;
}
.dev-item input {
  margin: 0;
}
label.dev-item:hover {
  color: #333;
}

.dev label:has(input[type='radio']) {
  background-color: #fff;
  box-shadow: 0px 2px 3px #0000002b;
  border-radius: 8px;
  padding: 0 8px 2px;
  font-size: 14px;
}
.dev label:has(input[type='radio']) input[type='radio'] {
  display: none;
}
.dev label:has(input[type='radio']:not(:checked)):hover {
  cursor: pointer;
  background-color: #f3f3f3;
}
.dev label:has(input[type='radio']:checked) {
  background-color: #333;
  color: #fff;
}

.dev .ellipsis-nowrap {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dev .hover:hover {
  opacity: 0.8;
}

.dev .selected-sug-wrapper {
  margin-top: 20px;
  background-color: #fff;
  padding: 12px 18px;
  min-height: 1000px;
  border-radius: 10px;
}
</style>
