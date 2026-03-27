<script lang="ts" setup>
import type { JSONSchema7 } from 'json-schema';
import { computed } from 'vue';

import MarkDown from '../components/MarkDown.vue';

const props = defineProps<{
  schema: JSONSchema7;
  definition: string;
  property: string;
  lang?: 'en' | 'ru';
}>();

const propData = computed<JSONSchema7>(() => {
  const def = props.schema.definitions?.[props.definition];
  if (def && typeof def === 'object') {
    const _propData = def.properties?.[props.property];
    return _propData && typeof _propData === 'object' ? _propData : {};
  }
  return {};
});

const getRefName = (refLink: string) => {
  return refLink.replace('#/definitions/', '');
};

const getRefType = (refLink: string) => {
  const refName = getRefName(refLink);
  const refObj = props.schema.definitions?.[refName];
  if (!refObj) {
    return [];
  }
  return getTypes(refObj as JSONSchema7);
};

const getTypes = (propertyData: JSONSchema7): any[] => {
  let types = [];

  if (Array.isArray(propertyData.type)) {
    types = propertyData.type;
  } else if (propertyData.anyOf) {
    types = propertyData.anyOf.map((pData) => getTypes(pData as JSONSchema7));
  } else if (propertyData.$ref) {
    types = [`${getRefName(propertyData.$ref)} (${getRefType(propertyData.$ref)})`];
  } else {
    types = [propertyData.type];
  }
  return types
    .filter(Boolean)
    .map((t) => (Array.isArray(t) && t.length > 1 ? `(${t.join(' | ')})` : t));
};

const types = computed(() => getTypes(propData.value));

const LOCALE_TAG_RE = /^@locale\s+([a-z-]+)\s*$/i;

const splitLocalizedDescription = (description: string) => {
  const sections: Partial<Record<'default' | 'en' | 'ru', string>> = {};
  let currentSection: 'default' | 'en' | 'ru' = 'default';
  let chunk: string[] = [];

  const flush = () => {
    const text = chunk.join('\n').trim();
    if (text) {
      sections[currentSection] = text;
    }
    chunk = [];
  };

  description
    .replace(/\r\n/g, '\n')
    .split('\n')
    .forEach((line) => {
      const localeMatch = line.match(LOCALE_TAG_RE);

      if (localeMatch) {
        flush();
        currentSection = localeMatch[1].toLowerCase() === 'ru' ? 'ru' : 'en';
        return;
      }

      chunk.push(line);
    });

  flush();
  return sections;
};

const localizedDescription = computed(() => {
  const description = propData.value.description;

  if (!description) {
    return '';
  }

  const sections = splitLocalizedDescription(description);
  const locale = props.lang ?? 'en';

  return sections[locale] || sections.default || description;
});
</script>

<template>
  <div>
    <p v-if="types.length">
      <code class="text-(--vp-c-text-1)!">{{ types.join(' | ') }}</code>
    </p>

    <MarkDown v-if="localizedDescription" :content="localizedDescription" />
  </div>
</template>
