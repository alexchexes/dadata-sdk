<script setup lang="ts">
import type { JSONSchema7 } from 'json-schema';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import SchemaProperty from '../components/SchemaProperty.vue';
import locales from '../locales-vue-component';
import schema from '../vue-component-schema.json';

const { lang = 'en' } = defineProps<{
  lang?: 'en' | 'ru';
}>();

watch(
  () => lang,
  (v) => (locale.value = v),
);

const { t, locale } = useI18n({
  messages: locales,
  useScope: 'local',
});

locale.value = lang;

const propsGroups = ref({
  general: ['token', 'suggestType', 'httpCache', 'url', 'payload', 'headers'],
  apiAddress: [
    'count',
    'locationsBoost',
    'locationsFilter',
    'fromBound',
    'toBound',
    'restrictValue',
    'radiusFilter',
    'division',
    'language',
  ],
  apiOther: [
    'entityType',
    'entityStatus',
    'branchType',
    'okved',
    'fioParts',
    'fioGender',
    'filters',
  ],
  behavior: [
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
  ],
});
</script>

<template>
  <template v-for="(theProps, groupName) in propsGroups" :key="groupName">
    <h3 :id="`${groupName.toLowerCase()}props`">{{ t(groupName) }}</h3>
    <template v-for="(propName, idx) in theProps" :key="idx">
      <h4 :id="propName.toLowerCase()">
        {{ propName }}
        <a
          class="header-anchor"
          :href="`#${propName.toLowerCase()}`"
          :aria-label="`Permalink to &quot;${propName} {#${propName.toLowerCase()}}&quot;`"
          >&ZeroWidthSpace;</a
        >
      </h4>
      <SchemaProperty
        :schema="schema as JSONSchema7"
        :property="propName"
        definition="VueDadataOptionsDocs"
      />
    </template>
  </template>
</template>
