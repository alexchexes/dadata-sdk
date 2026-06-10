import { titleCase } from 'scule';
import { createOpenApiSpec } from 'vitepress-openapi';

import spec from '../../packages/api-spec/dadata.json' with { type: 'json' };
import messages from '../locales-spec';
import { createMiniI18n } from './miniI18n';

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
  'court',
  'metro',
  'cars',
  'country',
  'currency',
  'mktu',
  'okved2',
  'okpd2',
  'oktmo',
];

type PathsGroup = 'byEndpointType' | 'byDirectoryType';

type VerbsObj = Record<
  string,
  {
    operationId: string;
    url: string;
    tags: string[];
    summary: string;
  }
>;

/** Representation of Paths Item Object for convenient lists of links */
type PathUi = {
  label: string;
  path: string;
  summary: string;
  description: string;
  operationId: string;
  url: string;
  docsLinks: string[];
  verbs: VerbsObj;
  pathTag?: string;
};

type GroupedPaths = Record<PathsGroup, Record<string, Record<string, PathUi>>>;

export const getGroupedPaths = (lang: string) => {
  const t = createMiniI18n({ locale: lang, messages: messages });
  const openApi = createOpenApiSpec({ spec: spec as any });
  const paths = openApi.getPaths();

  // set in advance to preserve order
  const groupedPaths: GroupedPaths = {
    byEndpointType: Object.fromEntries(endpointTypes.map((tag) => [tag, {}])),
    byDirectoryType: Object.fromEntries(directoryTypes.map((tag) => [tag, {}])),
  };

  // iterate fields of Paths Object
  Object.entries(paths).forEach(([path, pathObj]) => {
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
      .forEach(([httpVerb, verbData]) => {
        // collect info from an Operation Object
        if (verbData?.externalDocs?.url?.length && !docsLinks.includes(verbData.externalDocs.url)) {
          docsLinks.push(verbData.externalDocs.url);
        }

        if (!summary && verbData.summary) {
          summary = verbData.summary;
        }

        if (!description && verbData.description) {
          description = verbData.description;
        }

        if (!operationId) {
          operationId = verbData.operationId;
        }

        const server = verbData.servers?.[0]?.url || pathObj.servers?.[0]?.url;

        if (!url) {
          url = server + path;
        }

        verbs[httpVerb] = {
          operationId: verbData.operationId,
          url: server + path,
          tags: verbData.tags || [],
          summary: verbData.summary,
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

    // Iterate over verbs (Operations Objects) and add them to groups depending on their tags
    Object.values(verbs).forEach((verbData) => {
      let hasOtherTag = false;
      if (verbData.tags.some((t) => t === 'other')) {
        hasOtherTag = true;
      }

      const fallbackLabel = lang === 'en' ? titleCase(pathUiData.operationId) : pathUiData.summary;
      let label = fallbackLabel;

      verbData.tags.forEach((tag) => {
        // store adding logic in a var so we can reuse it if tag belongs to few groups
        const addPathToGroup = (groupToAdd: PathsGroup, i18nKey: string, lookupArray: string[]) => {
          // obtain label, i18n-d if possible (or fallback to operation's "summary" field)
          if (hasOtherTag === false) {
            const labelTag = verbData.tags.find((t) => lookupArray.includes(t) && t !== 'other');
            label = labelTag ? t(`${i18nKey}.${labelTag}`) : fallbackLabel;

            if (Object.values(groupedPaths[groupToAdd][tag]).find((op) => op.label === label)) {
              label = fallbackLabel;
            }
          }

          const pathUi = { ...pathUiData, label };
          groupedPaths[groupToAdd][tag][operationId] = pathUi;
        };

        if (endpointTypes.includes(tag)) {
          addPathToGroup('byEndpointType', 'byDirectoryType', directoryTypes);
        }

        if (directoryTypes.includes(tag)) {
          addPathToGroup('byDirectoryType', 'byEndpointType', endpointTypes);
        }
      });
    });
  });

  // Handle case when there's more than one operation / http-verb for a given Path
  Object.values(groupedPaths).forEach((tags) => {
    Object.values(tags).forEach((operations) => {
      Object.values(operations).forEach((pathUi) => {
        if (Object.keys(pathUi.verbs).length > 1) {
          // find tags common for all verbs in this path
          const commonTags = Object.values(pathUi.verbs)
            .map((v) => v.tags)
            .reduce((acc, arr) => acc.filter((tag) => arr.includes(tag)));

          // find tag that is unique to this path (i.e., not assigned to operations in any other paths)
          const pathTag = commonTags.find((_tag) => {
            const pathsForTag = openApi.getPathsByTags(_tag);
            return Object.keys(pathsForTag).length === 1 && pathUi.path in pathsForTag;
          });

          // if found, add it to this pathUi entry so later we can use it to add
          // link like /tags/${pathTag} to the according collapsible sidebar item
          if (pathTag) {
            pathUi.pathTag = pathTag;
          }
        }
      });
    });
  });

  return groupedPaths;
};
