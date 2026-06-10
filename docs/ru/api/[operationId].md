<script setup lang="ts">
import { useRoute } from 'vitepress'
import MarkDown from '../../components/MarkDown.vue';
import { getDocsLinks } from '../../utils/getDocsLinks'
const route = useRoute()
const operationId = route.data.params?.operationId
</script>

<OAOperation :operationId="operationId" >
<template #description="slotProps">
  <MarkDown :content="slotProps.operation.description"/>

  <template v-if="getDocsLinks(slotProps.operation, slotProps.path)">
    <h5>Ссылки на официальную документацию:</h5>
    <template v-for="link, idx in getDocsLinks(slotProps.operation, slotProps.path)" :key="idx">
      <small><a :href="link" target="_blank">{{ link }}</a></small>
    </template>
  </template>
</template>
</OAOperation>
