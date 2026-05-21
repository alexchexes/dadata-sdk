<script setup lang="ts">
import { useRoute } from 'vitepress'
import MarkDown from '../../components/MarkDown.vue';
import { getDocsLinks } from '../../utils/getDocsLinks'
const route = useRoute()
const operationId = route.data.params?.operationId
import { titleCase } from 'scule'
</script>

<OAOperation :operationId="operationId" >
<template #header="p">
  <h1>{{titleCase(operationId)}}</h1>
</template>

<template #description="slotProps">
<MarkDown :content="`> _If you're interested in the English version of this spec, let us know [on the GitHub](https://github.com/alexchexes/dadata-sdk)._`"/>
<MarkDown :content="slotProps.operation.description"/>

<template v-if="getDocsLinks(slotProps.operation, slotProps.path)">
  <h5>Official documentation:</h5>
  <template v-for="link, idx in getDocsLinks(slotProps.operation, slotProps.path)" :key="idx">
    <small><a :href="link" target="_blank">{{ link }}</a></small>
  </template>
</template>
</template>
</OAOperation>
