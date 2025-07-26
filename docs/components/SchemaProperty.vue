<script lang="ts" setup>
import type { JSONSchema7 } from 'json-schema';
import { computed } from 'vue';

import MarkDown from '../components/MarkDown.vue';

const props = defineProps<{
  schema: JSONSchema7;
  definition: string;
  property: string;
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
</script>

<template>
  <div>
    <p v-if="types.length">
      <code class="text-(--vp-c-text-1)!">{{ types.join(' | ') }}</code>
    </p>

    <MarkDown v-if="propData.description" :content="propData.description" />
  </div>
</template>
