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
<script lang="ts" setup>
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

| name                                     | Required | Type     | Description                                | Default     |
| ---------------------------------------- | -------- | -------- | ------------------------------------------ | ----------- |
| `v-model:modelValue` or simply `v-model` | Yes      | `string` | v-model for query                          | -           |
| `v-model:suggestion`                     | No       | `object` | v-model for the selected suggestion object | `undefined` |

### Properties

| Prop            | Required | Type                        | Description                                                                                                                                                                                                                                         | Default                                                                                                   |
| --------------- | -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| token           | Yes      | `string`                    | Auth token DaData.ru                                                                                                                                                                                                                                | `undefined`                                                                                               |
| placeholder     | No       | `string`                    | Text placeholder                                                                                                                                                                                                                                    | `''`                                                                                                      |
| url             | No       | `string`                    | special url for dadata api                                                                                                                                                                                                                          | [default dadata api url](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address)            |
| debounce        | No       | `number`                    | waiting time                                                                                                                                                                                                                                        | `'100ms'`                                                                                                 |
| disabled        | No       | `boolean`                   | disables input field                                                                                                                                                                                                                                | `false`                                                                                                   |
| suggestType     | No       | `string`                    | One of the [DaData Suggest API types](https://dadata.ru/api/suggest/)                                                                                                                                                                               | `address`                                                                                                 |
| division        | No       | `string`                    | [Type of territorial division](https://confluence.hflabs.ru/pages/viewpage.action?pageId=1326056589): `ADMINISTRATIVE` or `MUNICIPAL`. Defaults to `ADMINISTRATIVE`.                                                                                | `undefined`                                                                                               |
| fromBound       | No       | `string`                    | Dadata bound type FROM                                                                                                                                                                                                                              | `undefined`                                                                                               |
| toBound         | No       | `string`                    | Dadata bound type TO                                                                                                                                                                                                                                | `undefined`                                                                                               |
| inputName       | No       | `string`                    | Input name attribute                                                                                                                                                                                                                                | `'vue-dadata-input'`                                                                                      |
| locationsFilter | No       | `object`\|`object[]`        | [Restrict search by locations](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669108) (API `locations` option)                                                                                                                        | `undefined`                                                                                               |
| radiusFilter    | No       | `object`                    | [Restrict the search to a specified radius](https://confluence.hflabs.ru/pages/viewpage.action?pageId=990871806) around a given latitude and longitude (API `locations_geo` option)                                                                 | `undefined`                                                                                               |
| locationsBoost  | No       | `number`\|`string`\|`array` | 'kladr_id' or array of 'kladr_id's of region or city that should be prioritized by Dadata when it prepares list of suggestions on its side. Examples: - `55` - Omsk region - `63000001` - Samara city - `[50, 77]` - Moscow and Moscow-City regions | `undefined`                                                                                               |
| language        | No       | `string`                    | Language for displayed suggestions. `en` or `ru`. Default `ru`. `en` mostly just transliterates pretty much everything                                                                                                                              | `undefined`                                                                                               |
| classes         | No       | `object`                    | classes                                                                                                                                                                                                                                             | [DEFAULT_CLASSES](https://github.com/rusproject/vue-dadata/blob/rewritten/src/const/css-classes.const.ts) |
| showOnFocus     | No       | `boolean`                   | If `true` - then, if there is already fetched list of suggestions, it will be shown whenever input is focused                                                                                                                                       | `false`                                                                                                   |
| selectOnBlur    | No       | `boolean`                   | if `true`, automatically select first suggestion when input loses focus                                                                                                                                                                             | `false`                                                                                                   |
| selectOnEnter   | No       | `boolean`                   | if `true`, automatically select first suggestion when Enter pressed while suggestions visible                                                                                                                                                       | `true`                                                                                                    |
| enrichOnSelect  | No       | `boolean`                   | if `true`, after user selects a suggestion, an additional dadata api request is made to obtain data like geo coordinates and city_district. `suggestion` model is updated once again and the `enriched` event is emitted                            | `true`                                                                                                    |
| addSpace        | No       | `boolean`                   | if `true`, after user select a suggestion, an additional space is added to the input, so the user can just continue typing                                                                                                                          | `true`                                                                                                    |
| showClearButton | No       | `boolean`                   | if `true`, inside clear button is shown when the input field is not empty                                                                                                                                                                           | `false`                                                                                                   |
| payload         | No       | `object`\|`object[]`        | Custom **payload** for the API request. Any fields specified here will be added to the final request payload, or override existing values if already set.                                                                                           | `undefined`                                                                                               |
| headers         | No       | `object`                    | Custom **headers** for the API request. Any headers specified here will be added to the final request headers, or override existing values if already set.                                                                                          | `undefined`                                                                                               |

### Emits

| event      | Event payload type                                                             | Description                                                                                       |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| error      | `unknown`                                                                      | emitted in case of any error (usually only network errors occurs)                                 |
| enriched   | `DadataSuggestion`                                                             | emitted after selected suggestion was enriched in case `enrichOnSelect` props is `true`           |
| enrichFail | `string` (`unrestricted_value` of the suggestion that's failed to be enriched) | emitted if attemp to enrich selected suggestion failed (in case `enrichOnSelect` props is `true`) |
| focus      | `FocusEvent`                                                                   | emitted whenever input is focused                                                                 |
| blur       | `FocusEvent`                                                                   | emitted whenever input looses focus                                                               |

## Peer dependencies

- [vue](https://github.com/vuejs/vue)

## Dependencies

- [axios](https://github.com/axios/axios)
- [vue-debounce](https://github.com/dhershman1/vue-debounce)
- [vue-word-highlighter](https://github.com/kawamataryo/vue-word-highlighter)

Forked from [ikloster03/vue-dadata](https://github.com/ikloster03/vue-dadata)
