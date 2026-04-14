<script lang="ts" setup>
import type { JSONSchema7 } from 'json-schema';
import { computed } from 'vue';

import SchemaProperty from '../../../components/SchemaProperty.vue';
import { resolveSchemaPropertyName } from '../../../utils/schemaProperty';
import schemaRaw from '../../../vue-component-schema.json';
import IconExternalLink from './IconExternalLink.vue';

const schema = schemaRaw as JSONSchema7;

const props = defineProps<{
  property: string;
  lang?: 'en' | 'ru';
  docsLink?: string;
}>();

const resolvedProperty = computed(
  () => resolveSchemaPropertyName(schema, 'VueDadataOptionsDocs', props.property) || props.property,
);

const docsLinkLabel = computed(() => (props.lang === 'ru' ? 'Открыть документацию' : 'Open docs'));
</script>

<template>
  <div
    class="help-tooltip-doc vp-doc max-h-96 w-[min(28rem,calc(100vw-3rem))] overflow-auto rounded-xl border border-(--vp-c-divider) bg-(--vp-c-bg) p-3 text-sm text-(--vp-c-text-1) shadow-[0_18px_42px_rgba(2,6,23,0.18)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.45)]"
  >
    <div class="mb-2 flex items-center gap-2">
      <div class="min-w-0 font-mono text-xs text-(--vp-c-text-2)">
        {{ resolvedProperty }}
      </div>

      <a
        v-if="props.docsLink"
        class="docs-link inline-flex size-5 shrink-0 items-center justify-center rounded-md text-(--vp-c-text-3) opacity-70 transition-colors hover:text-(--vp-c-brand-1) hover:opacity-100"
        :aria-label="docsLinkLabel"
        :href="props.docsLink"
        rel="noopener"
        target="_blank"
        :title="docsLinkLabel"
      >
        <IconExternalLink />
      </a>
    </div>

    <SchemaProperty
      :schema="schema"
      definition="VueDadataOptionsDocs"
      :property="resolvedProperty"
      :lang="props.lang"
    />
  </div>
</template>

<style scoped>
.help-tooltip-doc :deep(p),
.help-tooltip-doc :deep(ul),
.help-tooltip-doc :deep(ol),
.help-tooltip-doc :deep(pre),
.help-tooltip-doc :deep(blockquote) {
  margin: 0.75rem 0;
}

.help-tooltip-doc :deep(p),
.help-tooltip-doc :deep(li),
.help-tooltip-doc :deep(blockquote) {
  line-height: 1.25rem;
}

.help-tooltip-doc :deep(ul),
.help-tooltip-doc :deep(ol) {
  padding-left: 1.25rem;
}

.help-tooltip-doc :deep(li) {
  margin: 0.35rem 0;
}

.help-tooltip-doc :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.help-tooltip-doc :deep(a:hover) {
  color: var(--vp-c-brand-2);
}

.docs-link {
  text-decoration: none;
}

.help-tooltip-doc :deep(code) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  background: var(--vp-c-bg-soft);
  padding: 0.125rem 0.3rem;
  font-size: 0.8125rem;
  line-height: 1;
}

.help-tooltip-doc :deep(table :not(pre) > code) {
  font-size: 13px;
  padding: 2px 4px;
}

.help-tooltip-doc :deep(pre) {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--vp-code-block-bg);
  padding: 0.75rem 0.9rem;
}

.help-tooltip-doc :deep(pre code) {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: inherit;
}

.help-tooltip-doc :deep(blockquote) {
  border-left: 2px solid var(--vp-c-divider);
  padding-left: 0.75rem;
  color: var(--vp-c-text-2);
}
</style>
