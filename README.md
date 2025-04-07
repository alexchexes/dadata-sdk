# Vue Dadata

[comment]: <> (![Publish]&#40;https://github.com/rusproject/vue-dadata/workflows/Publish/badge.svg&#41;)

This is a fork of [this Vue component](https://github.com/ikloster03/vue-dadata), which provides address suggestions using [DaData.ru](https://dadata.ru).

It targets **Vue 3.5+**.

For **Vue 2** and earlier Vue 3 versions (pre-3.5), please refer to [Ivan Monastyrev's original repository](https://github.com/ikloster03/vue-dadata).

## Install

```bash
$ pnpm install git+https://github.com/rusproject/vue-dadata.git#rewritten
```

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { VueDadata } from 'vue-dadata';
import 'vue-dadata/dist/vue-dadata.css';

const token = import.meta.env.VITE_APP_DADATA_API_KEY as string;

const query = ref('');
const suggestion = ref(undefined);
</script>

<template>
  <div>
    <VueDadata v-model="query" v-model:suggestion="suggestion" :token="token" />
  </div>
</template>
```

### V-Models

| name                      | Required | Description                                       | Type       | Default |
| ------------------------- | -------- | ------------------------------------------------- | ---------- | ------- |
| `v-model`                 | **YES**  | v-model for query (input string)                  | `string`   | -       |
| `v-model:suggestion`      |          | v-model for the selected suggestion object        | `object`   | -       |
| `v-model:suggestionsList` |          | v-model for currently fetched list of suggestions | `object[]` | -       |

### Component Props

#### General options

| Prop        | Required | Description                                                                             | Type / Possible values | Default                                                                                            |
| ----------- | -------- | --------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| token       | **YES**  | Dadata API key (token)                                                                  | `string`               |                                                                                                    |
| suggestType |          | One of the [DaData Suggest API types](https://dadata.ru/api/suggest/)                   | `string`               | `'address'`                                                                                        |
| httpCache   |          | If `false`, HTTP requests will not be cached.                                           | `boolean`              | `true`                                                                                             |
| url         |          | Custom Dadata API url                                                                   | `string`               | [https://suggestions.dadata.ru/...](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/) |
| payload     |          | Custom **payload** for the API request. Fields will be added to, or override existing.  | `object`\|`object[]`   |                                                                                                    |
| headers     |          | Custom **headers** for the API request. Headers will be added to, or override existing. | `object`               |                                                                                                    |

#### API requests options (`address` type). _All optional_

| Prop            | Description                                                                                                                                                          | Type / Possible values                                      | Default          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------- |
| count           | Maximum number of suggestion items to fetch from the DaData API. `Max: 20`                                                                                           | `number`                                                    | `10`             |
| locationsBoost  | Region or city that should be prioritized by Dadata when it prepares list of suggestions (`locations_boost` API param). `Max 10 items`                               | `string`\|`number`\|`object`\| `(string\|number\|object)[]` |                  |
| locationsFilter | [Restrict search by locations](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108) (`locations` API param). `Max 10 items`                          | `object`\|`object[]`                                        |                  |
| fromBound       | Limits the type of address object from which DaData begins searching (`from_bound` API param)                                                                        | `string`                                                    |                  |
| toBound         | Limits the type of address object to which DaData performs the search (`to_bound` API param)                                                                         | `string`                                                    |                  |
| restrictValue   | Used with `locationsFilter`, see the [Docs](https://confluence.hflabs.ru/pages/viewpage.action?pageId=1023737934) (`restrict_value` API param)                       | `string`                                                    |                  |
| radiusFilter    | Restrict the search to a [specified radius, latitude and longitude](https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806) (`locations_geo` API param) | `object`                                                    |                  |
| division        | [Type of territorial division](https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589): `ADMINISTRATIVE` or `MUNICIPAL`.                               | `string`                                                    | `ADMINISTRATIVE` |
| language        | Display language for address suggestions. `RU` or `EN`. The `EN` version mostly provides transliteration.                                                            | `RU`\|`EN`                                                  |                  |

#### API requests options for other suggestions types. _All optional_

| Prop         | Description                                                                                                 | Type / Possible values | Default |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------- | ------- |
| entityType   | Organization or bank type (for `party`, `party_by`, `party_kz`, and `bank` suggestions)                     | `string`\|`string[]`   |         |
| entityStatus | Organization or bank status (for `party`, `party_by` and `bank` suggestions)                                | `string`\|`string[]`   |         |
| okved        | OKVED code filter (for `party` suggestions). Max: `10` items                                                | `string`\|`string[]`   |         |
| fioParts     | Filter by FIO parts (for `fio` suggestions)                                                                 | `string`\|`string[]`   |         |
| fioGender    | Filter by gender (for `fio` suggestions)                                                                    | `string`               |         |
| filters      | Filters for APIs `fms_unit`, `fns_unit`, `metro`, `mktu`, `okpd2`, `okved2`, `postal_unit`, `region_court`. | `object`\|`object[]`   |         |

#### Component behavior options. _All optional_

| Prop              | Description                                                                                                         | Type / Possible values                    | Default                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| debounce          | Delay (in ms) after the user changes the query before triggering a request                                          | `number`                                  | `100`                                                                                                     |
| minChars          | Minimum length of text in the input after which suggestions are triggered                                           | `number`                                  | `1`                                                                                                       |
| disabled          | Disables the input, suggestions, and all interactions                                                               | `boolean`                                 | `false`                                                                                                   |
| placeholder       | Text used for the input's `placeholder="..."` attribute                                                             | `string`                                  |                                                                                                           |
| inputName         | Value for the input's `name="..."` attribute                                                                        | `string`                                  | `'vue-dadata-input'`                                                                                      |
| inputAttributes   | Additional attributes to pass to the input element.                                                                 | `object`                                  |                                                                                                           |
| suggestionsHint   | Text to show above the suggestions list                                                                             | `string`                                  | `'Выберите вариант или продолжите ввод'`                                                                  |
| noSuggestionsHint | Text to show in place of suggestions when there's no suggestions                                                    | `string`                                  |                                                                                                           |
| classes           | Custom CSS classes names for component elements                                                                     | `object`                                  | [DEFAULT_CLASSES](https://github.com/rusproject/vue-dadata/blob/rewritten/src/const/css-classes.const.ts) |
| showOnFocus       | Controls when to show the suggestions list on input focus                                                           | `'no_selection'` \| `'always'` \| `false` | `false`                                                                                                   |
| selectOnBlur      | If `true`, the first suggestion will be auto-selected after input lost focus                                        | `boolean`                                 | `false`                                                                                                   |
| selectOnEnter     | If `true`, pressing Enter selects the first suggestion (if list is open)                                            | `boolean`                                 | `true`                                                                                                    |
| enrichOnSelect    | if `true`, an additional request with `count: 1` is made to obtain additional data for the selected suggestion      | `boolean`                                 | `true`                                                                                                    |
| clearOnChange     | If `true`, clears the suggestion (`v-model:suggestion`) when input is changed after suggestion selection            | `boolean`                                 | `true`                                                                                                    |
| addSpace          | If `true`, adds a space to the input after a suggestion is selected                                                 | `boolean`                                 | `true`                                                                                                    |
| continueSelecting | If `true`, the suggestions list will remain visible after selecting a suggestion                                    | `boolean`                                 | `false`                                                                                                   |
| showClearButton   | If `true`, shows a clear (×) button in the input when not empty.                                                    | `boolean`                                 | `false`                                                                                                   |
| focusOnMounted    | If `true`, input will be focused immediately when the component is mounted.                                         | `boolean`                                 | `false`                                                                                                   |
| forceShow         | Forces the suggestions list to always remain visible (useful during development, e.g. when styling elements)        | `boolean`                                 | `false`                                                                                                   |
| forceHide         | Forces the suggestions list to always remain hidden. Useful when creating custom UI using `v-model:suggestionsList` | `boolean`                                 | `false`                                                                                                   |

### Emitted events

| Event      | When emitted                                                                  | Event payload type                       |
| ---------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| error      | In case of any error (usually only network errors occurs)                     | `unknown`                                |
| enriched   | After selected suggestion was enriched (if `enrichOnSelect` is `true`)        | `object` (suggestion)                    |
| enrichFail | If attemp to enrich selected suggestion fails (if `enrichOnSelect` is `true`) | `string` (suggestion.unrestricted_value) |
| focus      | Whenever input is focused                                                     | `FocusEvent`                             |
| blur       | Whenever input looses focus                                                   | `FocusEvent`                             |

## Slots

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

## Peer dependencies

- [vue](https://github.com/vuejs/vue)

## Dependencies

- [axios](https://github.com/axios/axios)
- [@vueuse/core](https://vueuse.org/)

Forked from [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)
