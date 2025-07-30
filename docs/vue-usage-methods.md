```vue
<script setup>
// ...
const query = ref('');
const suggestion = ref(undefined);
const vueDadata = useTemplateRef('vueDadata');

onMounted(async () => {
  // `focus()`: Autofocus the input with a small delay after page load
  setTimeout(() => {
    vueDadata.value?.focus();
  }, 300);

  // set "selected suggestion" v-model manually
  suggestion.value = {
    /*...existing suggestion object...*/
  };
  // wait one tick so that v-model:suggestion propagates and changes the `query`
  await nextTick();
  // now fetch suggestions list with `update()`
  const suggestions = await vueDadata.value?.update();
  // the updated suggestions list is also available in the return value
  console.log('Updated. Suggestions: ', suggestions);

  // and finally use `show()` to open the dropdown programmatically
  vueDadata.value?.show();
});
</script>

<template>
  <VueDadata ref="vueDadata" v-model="query" v-model:suggestion="suggestion" ... />

  <!-- Access to the fetched suggestions list -->
  <pre>{{ vueDadata?.suggestionsList }}</pre>
</template>
```
