<script lang="ts" setup>
import { ref } from 'vue';
import VueDadata from './VueDadata.vue';
import type { HighlightOptions, Suggestion } from './types';

const token = import.meta.env.VITE_APP_DADATA_API_KEY as string;

const query = ref('');
const suggestion = ref<Suggestion | undefined>(undefined);
const highlightOptions: HighlightOptions = {
  highlightTag: 'span',
};

const reset = () => {
  query.value = '';
  suggestion.value = undefined;
};

const selectOnBlur = ref(false);
const selectOnEnter = ref(true);
const disabled = ref(false);
</script>

<template>
  <main>
    <div class="developer-meta">
      <label class="checkbox-label">
        selectOnBlur: <input v-model="selectOnBlur" type="checkbox" />
      </label>

      <label class="checkbox-label">
        selectOnEnter: <input v-model="selectOnEnter" type="checkbox" />
      </label>

      <label class="checkbox-label"> disabled: <input v-model="disabled" type="checkbox" /> </label>

      <div>
        query: <b>{{ query }}</b>
      </div>
    </div>

    <VueDadata
      v-model="query"
      v-model:suggestion="suggestion"
      :disabled="disabled"
      :highlight-options="highlightOptions"
      :select-on-blur="selectOnBlur"
      :select-on-enter="selectOnEnter"
      :token="token"
      placeholder="Start typing..."
    >
      <template #inputOverlay>
        <button v-if="query && !disabled" class="clear-button" @click="reset">x</button>
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

.checkbox-label {
  align-items: center;
  display: flex;
  gap: 8px;
}
.checkbox-label input {
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
