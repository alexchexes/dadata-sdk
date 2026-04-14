<script lang="ts" setup>
import type { JSONSchema7 } from 'json-schema';
import { computed } from 'vue';

import MarkDown from '../components/MarkDown.vue';
import {
  getLocalizedSchemaDescription,
  getSchemaPropertyData,
  getSchemaPropertyTypes,
} from '../utils/schemaProperty';

const props = defineProps<{
  schema: JSONSchema7;
  definition: string;
  property: string;
  lang?: 'en' | 'ru';
}>();

const propData = computed<JSONSchema7>(
  () => getSchemaPropertyData(props.schema, props.definition, props.property) as JSONSchema7,
);

const localizedDescription = computed(() => {
  return getLocalizedSchemaDescription(propData.value.description, props.lang ?? 'en');
});

const types = computed(() => getSchemaPropertyTypes(props.schema, propData.value));
</script>

<template>
  <div>
    <p v-if="types.length">
      <code class="text-(--vp-c-text-1)!">{{ types.join(' | ') }}</code>
    </p>

    <MarkDown v-if="localizedDescription" :content="localizedDescription" />
  </div>
</template>
