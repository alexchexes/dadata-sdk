---
outline: [2, 3]
---

<script setup lang="ts">
import schema from '../component-schema.json' 
import SchemaProperty from '../components/SchemaProperty.vue'
</script>

# Компонент DaData-подсказок для Vue 3.

Попробуйте [демо](/ru/demo), чтобы ознакомиться с возможностями компонента.

## Установка

```bash
$ pnpm install git+https://github.com/rusproject/vue-dadata.git#rewritten
```

## Использование

```vue
<script setup>
import { ref } from 'vue';
import { VueDadata } from 'vue-dadata';
import 'vue-dadata/dist/vue-dadata.css';

const token = import.meta.env.VITE_APP_DADATA_API_KEY;

const query = ref('');
const suggestion = ref(undefined);
</script>

<template>
  <div>
    <VueDadata v-model="query" v-model:suggestion="suggestion" :token="token" />
  </div>
</template>
```

## V-Models

| name                 | Description                                | Type     |
| -------------------- | ------------------------------------------ | -------- |
| `v-model` (required) | v-model for query (input string)           | `string` |
| `v-model:suggestion` | v-model for the selected suggestion object | `object` |

## Пропсы

### Основные настройки

#### token

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="token" />

#### suggestType

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="suggestType" />

#### httpCache

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="httpCache" />

#### url

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="url" />

#### payload

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="payload" />

#### headers

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="headers" />

### Запросы к Адресам

#### count

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="count" />

#### locationsBoost

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="locationsBoost" />

#### locationsFilter

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="locationsFilter" />

#### fromBound

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="fromBound" />

#### toBound

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="toBound" />

#### restrictValue

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="restrictValue" />

#### radiusFilter

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="radiusFilter" />

#### division

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="division" />

#### language

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="language" />

### Запросы к другим типам подсказок

#### entityType

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="entityType" />

#### entityStatus

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="entityStatus" />

#### branchType

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="branchType" />

#### okved

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="okved" />

#### fioParts

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="fioParts" />

#### fioGender

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="fioGender" />

#### filters

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="filters" />

### Поведение компонента

#### debounce

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="debounce" />

#### minChars

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="minChars" />

#### disabled

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="disabled" />

#### placeholder

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="placeholder" />

#### inputName

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="inputName" />

#### inputAttributes

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="inputAttributes" />

#### suggestionsHint

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="suggestionsHint" />

#### noSuggestionsHint

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="noSuggestionsHint" />

#### classes

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="classes" />

#### showOnFocus

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="showOnFocus" />

#### selectOnBlur

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="selectOnBlur" />

#### selectOnEnter

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="selectOnEnter" />

#### enrichOnSelect

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="enrichOnSelect" />

#### clearOnChange

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="clearOnChange" />

#### addSpace

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="addSpace" />

#### continueSelecting

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="continueSelecting" />

#### showClearButton

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="showClearButton" />

#### focusOnMounted

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="focusOnMounted" />

#### forceShow

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="forceShow" />

#### forceHide

<SchemaProperty :schema="schema" definition="VueDadataOptionsDocs" property="forceHide" />

## События компонента

| Event      | When emitted                                                                                                                                         | Event payload type                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| error      | In case of any error (usually only network errors occurs)                                                                                            | `unknown`                                                                     |
| select     | Emitted when a suggestion is selected, either by clicking it in the dropdown, pressing "Enter", or automatically when `selectOnBlur=true` is enabled | `(suggestion: DadataSuggestion, selectType: string)`                          |
| enriched   | After selected suggestion was enriched (if `enrichOnSelect=true`)                                                                                    | `(suggestion: DadataSuggestion, diff: DeepPartial<DadataSuggestion> \| null)` |
| enrichFail | If attemp to enrich selected suggestion fails (if `enrichOnSelect` is `true`)                                                                        | `string` (suggestion.unrestricted_value)                                      |
| focus      | Whenever input is focused                                                                                                                            | `FocusEvent`                                                                  |
| blur       | Whenever input looses focus                                                                                                                          | `FocusEvent`                                                                  |

## Слоты

### inputWrapper

Wraps the entire input area including the input field, clear button, and overlays. You can (and usually, should) bind at least `coreInputProps`, which adds event-handlers and sets `value` (which is not just `query`, but visible value when navigating with keyboard). `browserAutoProps` holds attributes like `autocomplete='off'` and a few similar to disable browser input features.

```vue
<template #inputWrapper="{ allInputProps, coreInputProps, browserAutoProps }">
  <!-- Your custom input/wrapper/anything -->
  <div class="...">
    <MyInput v-bind="coreInputProps" />
    <MyOverlay>
  </div>
</template>
```

### input

Replaces the `<input>` element itself. Useful for injecting your own input component. You can even replace it with `<textarea>` while preserving default styling:

```vue
<template #input="{ allInputProps, coreInputProps, browserAutoProps }">
  <textarea v-bind="allInputProps" />
</template>
```

### inputOverlay

By default, en empty slot. It is just there so you can pass any custom content inside the input wrapper. Useful for loading indicators, icons, etc.

```vue
<template #inputOverlay>
  <!-- Custom loading spinner, icons, buttons, etc -->
</template>
```

### clearButtonIcon

Overrides the built-in clear (×) button icon

```vue
<template #clearButtonIcon>
  <svg><!----></svg>
</template>
```

### hint

Overrides hint section above the suggestions inside the dropdown list.

If you use this slot, it will overrides both `suggestionsHint` and `noSuggestionsHint` hints, even if you pass them as props.

Also note that component logic is currently shows the dropdown (where hints reside) without suggestions only when `noSuggestionsHint` is provided via props.
So if you use this slot to style hint when there's no suggestions, you apparently need to pass something to `noSuggestionsHint` prop to make it work. This will be refactored later.

```vue
<template #hint>
  <div class="...">This is my fancy-styled hint...</div>
</template>
```

### suggestions

Overrides the entire suggestions list (everything inside the dropdown, but not the dropdown itself)

```vue
<template #suggestions="{ suggestionsList, navigatedIndex, handleSuggestionClick }">
  <div v-for="(suggestion, index) in suggestionsList" :key="index">
    <!-- Custom items rendering -->
  </div>
</template>
```

### suggestionItem

Replaces whole suggestion item element. If you use this, you will need to manually handle clicks with `@mousedown.prevent="handleSuggestionClick(index)"`.

```vue
<template #suggestionItem="{ suggestion, index, isNavigated, handleSuggestionClick }">
  <button @mousedown.prevent="handleSuggestionClick(index)">
    {{ suggestion.value }}
  </button>
</template>
```

### suggestionItemContent

Replaces inner content of a suggestion item. Useful when you want to completely re-style suggestion without need to handle clicks automatically

```vue
<template #suggestionItemContent="{ suggestion, isNavigated }">
  {{ suggestion.value }}
</template>
```

### suggestionItemTitle

Overrides the main title (`value`) of a suggestion item

```vue
<template #suggestionItemTitle="{ suggestion, isNavigated }">
  <span class="...">{{ suggestion.value }}</span>
</template>
```

### suggestionItemSubtitle

Overrides a suggestion subtitle. By default, there are only subtitles for `party` and `bank` suggestions. Using this slot you can create your own subtitle for any type.

```vue
<template #suggestionItemSubtitle="{ suggestion, isNavigated }">
  <div class="...">{{ suggestion.data.inn }}</div>
</template>
```

## Методы компонента

If you're using `ref` to access the `<VueDadata />` instance, the following properties and methods are exposed via `defineExpose()`:

| Name                | Type                                          | Description                                                              |
| ------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `inputRef`          | `ShallowRef<HTMLInputElement \| null>`        | Reference to the internal `<input>` element.                             |
| `suggestionsList`   | `Ref<DadataSuggestion[], DadataSuggestion[]>` | Currently fetched list of suggestions.                                   |
| `isDropdownVisible` | `ComputedRef<boolean>`                        | `true` when suggestions dropdown is visible.                             |
| `isFocused`         | `ComputedRef<boolean>`                        | `true` when `<input>` element is focused.                                |
| `focus()`           | `() => void`                                  | Focuses the `<input>` element.                                           |
| `blur()`            | `() => void`                                  | Removes focus from the `<input>` element.                                |
| `show()`            | `() => void`                                  | Shows suggestions dropdown if there are suggestions loaded               |
| `hide()`            | `() => void`                                  | Hides suggestions dropdown                                               |
| `clear()`           | `() => void`                                  | Clears query (`modelValue`), `suggestion` and `suggestionsList` v-models |

#### Пример

```vue
<template>
  <VueDadata ref="vueDadataRef" ... />
</template>

<script setup>
import { useTemplateRef } from 'vue';

const vueDadataRef = useTemplateRef('vueDadataRef');

onMounted(() => {
  setTimeout(() => {
    vueDadataRef.value?.focus(); // Autofocus the input with slight delay
  }, 300);
});
</script>
```

## Зависимости

- [axios](https://github.com/axios/axios)
- [@vueuse/core](https://vueuse.org/)

#### Peer зависимости

- [Vue](https://github.com/vuejs/vue)

Based on [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)
