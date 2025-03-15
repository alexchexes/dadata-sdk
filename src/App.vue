<script lang="ts" setup>
import { computed, ref } from 'vue';
import VueDadata from './VueDadata.vue';
import type { VueDadataProps } from './VueDadata.vue';
import type { AddressSuggestion } from './types';

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
    options.value.locationsBoost = ids.length ? ids : undefined;
  },
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
    | 'selectOnBlur'
    | 'selectOnEnter'
    | 'disabled'
    | 'count'
    | 'highlightOptions'
    | 'placeholder'
    | 'enrichOnSelect'
    | 'addSpace'
    | 'continueSelecting'
    | 'showClearButton'
    | 'locationOptions'
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
  count: 10,
  selectOnBlur: false,
  selectOnEnter: true,
  enrichOnSelect: true,
  addSpace: true,
  continueSelecting: false,
  showClearButton: false,
  locationsBoost: undefined,
  language: 'ru',
});

const handleEnriched = (suggestion: AddressSuggestion) => {
  console.info('suggestion enriched: ', suggestion);
};
</script>

<template>
  <main>
    <div class="developer-meta">
      <div class="developer-meta-item">
        token:
        <input v-model.trim="visibleToken" placeholder="***************************" type="text" />
      </div>

      <label class="developer-meta-item">
        disabled: <input v-model="options.disabled" type="checkbox" />
      </label>

      <div class="developer-meta-item">
        placeholder: <input v-model.trim="options.placeholder" type="text" />
      </div>

      <div class="developer-meta-item">
        count: <input v-model.number="options.count" max="20" min="1" step="1" type="range" />
        {{ options.count }}
      </div>

      <label class="developer-meta-item">
        selectOnBlur: <input v-model="options.selectOnBlur" type="checkbox" />
      </label>

      <label class="developer-meta-item">
        selectOnEnter: <input v-model="options.selectOnEnter" type="checkbox" />
      </label>

      <label class="developer-meta-item">
        enrichOnSelect: <input v-model="options.enrichOnSelect" type="checkbox" />
      </label>

      <label class="developer-meta-item">
        addSpace: <input v-model="options.addSpace" type="checkbox" />
      </label>

      <label class="developer-meta-item">
        continueSelecting: <input v-model="options.continueSelecting" type="checkbox" />
      </label>

      <label class="developer-meta-item">
        showClearButton: <input v-model="options.showClearButton" type="checkbox" />
      </label>

      <div class="developer-meta-item">
        locationsBoost (kladr_id's): <input v-model="locationsBoostModel" type="text" />
        {{ options.locationsBoost }}
      </div>

      <div class="developer-meta-item">
        language :
        <select v-model="options.language">
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
      </div>

      <div>
        query: <b>{{ query }}</b>
      </div>
    </div>

    <VueDadata
      v-model="query"
      v-model:suggestion="suggestion"
      :token="usedToken"
      v-bind:="options"
      @enriched="handleEnriched"
    />

    <section v-if="suggestion">
      Current suggestion:
      <button @click="reset">Clean</button>

      <pre>{{ suggestion }}</pre>
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

section {
  margin-top: 10px;
  border-radius: 4px;
  background-color: #fff;
  padding: 10px 20px;
}

pre {
  white-space: pre-wrap;
  font-size: 14px;
}

.developer-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.developer-meta-item {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: fit-content;
}
.developer-meta-item input {
  margin: 0;
}
label.developer-meta-item:hover {
  color: #333;
}
</style>
