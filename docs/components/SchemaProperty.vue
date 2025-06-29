<script lang="ts" setup>
import markdownit from 'markdown-it';
import { computed } from 'vue';

const props = defineProps<{
  schema: Record<string, unknown>;
  definition: string;
  property: string;
}>();

const md = markdownit();

// Remember the old renderer if overridden, or proxy to the default renderer.
var defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  tokens[idx].attrSet('target', '_blank');
  return defaultRender(tokens, idx, options, env, self);
};

const propData = computed(
  () => props.schema.definitions[props.definition].properties[props.property],
);

const description = computed<string | null>(() => {
  const descr = propData.value.description
    ?.replaceAll(/{\s*@link (https?:\/\/(.+?))\s*}/g, '[$2]($1)')
    .replaceAll(/@see\s+(https?:\/\/(\S+?))(\s|\n|$)/g, 'see: [$2]($1)');
  return descr ? md.render(descr) : null;
});

const getRefName = (refLink: string) => {
  return refLink.replace('#/definitions/', '');
};

const getRefType = (refLink) => {
  const refName = getRefName(refLink);
  const refObj = props.schema.definitions[refName];
  if (!refObj) {
    return [];
  }
  return getTypes(refObj);
};

const getTypes = (propertyData): any[] => {
  let types = [];

  if (Array.isArray(propertyData.type)) {
    types = propertyData.type;
  } else if (propertyData.anyOf) {
    types = propertyData.anyOf.map((pData) => getTypes(pData));
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

    <div v-html="description" />
  </div>
</template>
