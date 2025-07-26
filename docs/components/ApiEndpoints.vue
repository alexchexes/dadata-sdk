<script setup lang="ts">
import { OpenApi } from 'vitepress-openapi';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import spec from '../../packages/api-spec/dadata.json' with { type: 'json' };
import MarkDown from '../components/MarkDown.vue';

const { lang = 'en' } = defineProps<{
  lang?: 'en' | 'ru';
}>();
watch(
  () => lang,
  (v) => (locale.value = v),
);
const { t, locale } = useI18n();
locale.value = lang;

const endpointTypes = ['suggest', 'findById', 'clean', 'other', 'account'];

const directoryTypes = [
  'address',
  'fias',
  'party',
  'party_by',
  'party_kz',
  'bank',
  'fio',
  'email',
  'phone',
  'fms_unit',
  'passport',
  'birthdate',
  'postal_unit',
  'fns_unit',
  'fts_unit',
  'region_court',
  'metro',
  'car_brand',
  'vehicle',
  'country',
  'currency',
  'mktu',
  'okved2',
  'okpd2',
  'oktmo',
];

const openApi = OpenApi({ spec: spec as any });
const paths = computed(() => openApi.getPaths());

type VerbsObj = Record<
  string,
  {
    operationId: string;
    url: string;
    tags: string[];
  }
>;

/** Simplified representation of Paths Item Object */
type PathUi = {
  label: string;
  path: string;
  summary: string;
  description: string;
  operationId: string;
  url: string;
  docsLinks: string[];
  verbs: VerbsObj;
};

type GroupsTypes = Record<
  'byEndpointType' | 'byDirectoryType',
  Record<string, Record<string, PathUi>>
>;

const groupTypes = computed(() => {
  // set in advance to preserve order
  const groupTypes: GroupsTypes = {
    byEndpointType: Object.fromEntries(endpointTypes.map((tag) => [tag, {}])),
    byDirectoryType: Object.fromEntries(directoryTypes.map((tag) => [tag, {}])),
  };

  // iterate fields of Paths Object
  Object.entries(paths.value).forEach(([path, pathObj]) => {
    // for simplicity we save first found operation data, while
    // collecting info about other operations into "verbs" object
    const docsLinks: string[] = [];
    let summary = pathObj.summary || '';
    let description = pathObj.description || '';
    const verbs: VerbsObj = {};
    let operationId = '';
    let url = '';

    if (pathObj['x-externalDocs']) {
      (pathObj['x-externalDocs'] as Record<'url', string>[])
        .filter((docsObj) => !docsLinks.includes(docsObj.url))
        .forEach((docsObj) => docsLinks.push(docsObj.url));
    }

    // iterate over Operation Objects
    Object.entries(pathObj)
      .filter(([_, v]) => v && typeof v === 'object' && 'operationId' in v)
      .forEach(([httpVerb, opObj]) => {
        // collect info from an Operation Object
        if (opObj?.externalDocs?.url?.length && !docsLinks.includes(opObj.externalDocs.url)) {
          docsLinks.push(opObj.externalDocs.url);
        }

        if (!summary && opObj.summary) {
          summary = opObj.summary;
        }

        if (!description && opObj.description) {
          description = opObj.description;
        }

        if (!operationId) {
          operationId = opObj.operationId;
        }

        const server = opObj.servers?.[0]?.url || pathObj.servers?.[0]?.url;

        if (!url) {
          url = server + path;
        }

        verbs[httpVerb] = {
          operationId: opObj.operationId,
          url: server + path,
          tags: opObj.tags || [],
        };
      });

    const pathUiData = {
      path,
      summary,
      description,
      operationId,
      url,
      docsLinks,
      verbs,
    };

    // Now iterate over Operations Objects once again and add them to groups depending on their tags
    Object.values(verbs).forEach((verbData) => {
      let hasOtherTag = false;
      if (verbData.tags.some((t) => t === 'other')) {
        hasOtherTag = true;
      }

      let label = pathUiData.summary;

      verbData.tags.forEach((tag) => {
        if (endpointTypes.includes(tag)) {
          if (hasOtherTag === false) {
            const labelTag = verbData.tags.find((t) => directoryTypes.includes(t) && t !== 'other');
            label = labelTag ? t(`byDirectoryType.${labelTag}`) : pathUiData.summary;
            if (Object.values(groupTypes.byEndpointType[tag]).find((op) => op.label === label)) {
              label = pathUiData.summary;
            }
          }
          const pathUi = { ...pathUiData, label };
          groupTypes.byEndpointType[tag][operationId] = pathUi;
        }

        if (directoryTypes.includes(tag)) {
          if (hasOtherTag === false) {
            const labelTag = verbData.tags.find((t) => endpointTypes.includes(t) && t !== 'other');
            label = labelTag ? t(`byEndpointType.${labelTag}`) : pathUiData.summary;
            if (Object.values(groupTypes.byDirectoryType[tag]).find((op) => op.label === label)) {
              label = pathUiData.summary;
            }
          }
          const pathUi = { ...pathUiData, label };
          groupTypes.byDirectoryType[tag][operationId] = pathUi;
        }
      });
    });
  });

  return groupTypes;
});
</script>

<template>
  <template v-for="(groups, groupType) in groupTypes" :key="groupType">
    <h2 :id="groupType">{{ t(`${groupType}.label`) }}</h2>

    <template v-for="(operations, groupTag) in groups" :key="groupTag">
      <h3 :id="`${groupType}.${groupTag}`">{{ t(`${groupType}.${groupTag}`) }}</h3>

      <MarkDown
        :content="openApi.getTags().find((tagObj) => tagObj.name === groupTag)?.description"
      />

      <table>
        <thead v-if="groupType === 'byEndpointType'">
          <tr>
            <th>{{ t(`enpointsTableHeader.${groupTag}`) }}</th>
            <th>Docs</th>
            <th>API URL</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(opObj, operationId) in operations" :key="operationId">
            <tr>
              <td>
                <b>
                  <a :href="`/${lang}/operations/${operationId}`">
                    {{ opObj.label }}
                  </a>
                </b>
              </td>

              <td>
                <template v-for="(url, idx) in opObj.docsLinks" :key="idx">
                  <a :href="url" target="_blank">[{{ idx + 1 }}]</a>
                  <span class="last-hidden">+</span>
                </template>
              </td>
              <td>
                <code
                  ><a :href="opObj.url" target="_blank">{{ opObj.path.slice(1) }}</a></code
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
