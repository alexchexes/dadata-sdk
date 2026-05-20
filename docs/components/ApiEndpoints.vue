<script setup lang="ts">
import { withBase } from 'vitepress';
import { createOpenApiSpec } from 'vitepress-openapi';
import { useI18n } from 'vue-i18n';

import spec from '../../packages/api-spec/dadata.json' with { type: 'json' };
import MarkDown from '../components/MarkDown.vue';
import { getGroupedPaths } from '../utils/getGroupedPaths';

const { lang = 'en' } = defineProps<{
  lang?: 'en' | 'ru';
}>();
const { t, locale } = useI18n();
locale.value = lang;

const openApi = createOpenApiSpec({ spec: spec as any });
const groupedPaths = getGroupedPaths(lang);

function getOperationHref(operationId: string, pathTag?: string) {
  return withBase(pathTag ? `/${lang}/tags/${pathTag}` : `/${lang}/api/${operationId}`);
}
</script>

<template>
  <template v-for="(tags, groupName) in groupedPaths" :key="groupName">
    <h2 :id="groupName">{{ t(`${groupName}.label`) }}</h2>

    <template v-for="(operations, tag) in tags" :key="tag">
      <h3 :id="tag">{{ t(`${groupName}.${tag}`) }}</h3>

      <MarkDown :content="openApi.getTags().find((tagObj) => tagObj.name === tag)?.description" />

      <table>
        <thead v-if="groupName === 'byEndpointType'">
          <tr>
            <th>{{ t(`enpointsTableHeader.${tag}`) }}</th>
            <th>Docs</th>
            <th>API URL</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(pathUi, operationId) in operations" :key="operationId">
            <tr>
              <td>
                <b>
                  <a :href="getOperationHref(operationId, pathUi.pathTag)">
                    {{ pathUi.label }}
                  </a>
                </b>
              </td>

              <td>
                <template v-for="(url, idx) in pathUi.docsLinks" :key="idx">
                  <a :href="url" target="_blank">[{{ idx + 1 }}]</a>
                  <span class="last-hidden">+</span>
                </template>
              </td>
              <td>
                <code
                  ><a :href="pathUi.url" target="_blank">{{ pathUi.path.slice(1) }}</a></code
                >
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </template>
</template>

<style>
.last-hidden:last-child {
  display: none;
}
</style>
