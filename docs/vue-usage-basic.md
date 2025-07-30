```vue
<script setup>
import { ref } from 'vue';
import { VueDadata } from 'vue-dadata';
// use shipped CSS if needed:
import 'vue-dadata/dist/vue-dadata.css';

const token = import.meta.env.VITE_APP_DADATA_API_KEY; // API key

const query = ref(''); // input field value
const suggestion = ref(undefined); // selected suggestion
</script>

<template>
  <VueDadata v-model="query" v-model:suggestion="suggestion" :token="token" />
</template>
```
