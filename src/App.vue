<script lang="ts" setup>
import { computed, ref } from 'vue';
import VueDadata from './VueDadata.vue';
import type { VueDadataProps } from './VueDadata.vue';
import type { AddressSuggestion } from './types';

const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;
const userProvidedToken = ref<string | undefined>();
const usedToken = computed(() => userProvidedToken.value || envToken);
const visibleToken = computed({
  get: () => userProvidedToken.value || '',
  set: (val) => (userProvidedToken.value = val),
});

const query = ref('');
const suggestion = ref<AddressSuggestion | undefined>(undefined);

const reset = () => {
  query.value = '';
  suggestion.value = undefined;
};

type PartialDadataProps = Pick<
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
>;

const options = ref<PartialDadataProps>({
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
});

const handleEnriched = (suggestion: AddressSuggestion) => {
  console.info('suggestion enriched: ', suggestion);
};
</script>

<template>
  <main>
    <div class="developer-meta">
      <label class="developer-meta-item">
        token:
        <input v-model.trim="visibleToken" placeholder="***************************" type="text" />
      </label>

      <label class="developer-meta-item">
        disabled: <input v-model="options.disabled" type="checkbox" />
      </label>

      <label class="developer-meta-item">
        placeholder: <input v-model.trim="options.placeholder" type="text" />
      </label>

      <div class="developer-meta-item">
        count: <input v-model.number="options.count" max="20" min="1" step="1" type="range" />
        {{ options.count }}
      </div>

      <div class="developer-meta-item">
        selectOnBlur: <input v-model="options.selectOnBlur" type="checkbox" />
      </div>

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
    >
      <template #inputOverlay>
        <button v-if="query && !options.disabled" class="clear-button" @click="reset">x</button>
      </template>
    </VueDadata>

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
  gap: 8px;
}
.developer-meta-item input {
  margin: 0;
}
.clear-button {
  position: absolute;
  right: 0;
  top: 50%;
  translate: 0 -50%;
  height: 100%;
  margin: 0;
  padding: 0 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
}
.clear-button:disabled {
  display: none;
}
.clear-button:hover {
  color: red;
  background-color: #8882;
}
</style>
