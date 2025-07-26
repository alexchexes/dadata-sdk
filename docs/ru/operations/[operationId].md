<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useTheme } from 'vitepress-openapi/client'
import { OpenApi } from 'vitepress-openapi';
import MarkDown from '../../components/MarkDown.vue';
import spec from '../../../packages/api-spec/dadata.json' with { type: 'json' };
import { computed } from 'vue';

const openApi = OpenApi({ spec: spec as any });
const paths = computed(() => openApi.getPaths());

useTheme({
  i18n: { 
    locale: 'ru'
  }
})

const route = useRoute()

const operationId = route.data.params?.operationId

const getDocsLinks = (operation: Record<string, any>, path: Record<string, any>): string[] => {
  const links: string[] = [];
  if (operation.externalDocs) {
    links.push(operation.externalDocs.url)
  }
  if (path['x-externalDocs']) {
    (path['x-externalDocs'] as Record<'url', string>[])
      .filter(linkObj => !links.includes(linkObj.url))
      .forEach(linkObj => links.push(linkObj.url));
  }
  return links;
}
</script>

<OAOperation :operationId="operationId" >
<template #description="slotProps">
  <MarkDown :content="slotProps.operation.description"/>

  <template v-if="getDocsLinks(slotProps.operation, paths[slotProps.path])">
    <h5>Ссылки на документацию:</h5>
    <template v-for="link, idx in getDocsLinks(slotProps.operation, paths[slotProps.path])" :key="idx">
      <small><a :href="link" target="_blank">{{ link }}</a></small>
    </template>
  </template>
</template>
</OAOperation>
