---
outline: [2, 3]
---

<script setup lang="ts">
import ComponentSchema from '../components/ComponentSchema.vue'
</script>

# DaData-suggestions component for Vue 3

Try the demo playground to understand how it works.

### [Demo](/en/demo) {#demo}

## Install {#installation}

This package is not published on `npm` yet.

To install it from the GitHub repo, try:

```bash
pnpm install git+https://github.com/alexchexes/dadata-sdk.git#rewritten
```

Or clone the repo and connect it via a local link in your `package.json`:

```json
{
  "dependencies": {
    "@dadata-sdk/vue": "link:..\\dadata-sdk\\packages\\vue-dadata"
  }
}
```

## Usage {#usage}

<!-- @include: ../vue-usage-basic.md -->

## V-Models {#v-models}

### `v-model`

- **Required**
- **Type:** `string`

The _v-model_ for the query text. The value is used in API calls and is synced with the input field (`<input>`) all the time, except when navigating suggestions with keyboard (↑↓ keys) — during such a navigation, the input field displays the text from the currently navigated (highlighted) suggestion, while the v-model value retains the text that was in the field before navigation began. After a suggestion is selected or navigation ends (_Esc_, click outside), the field will be in sync with the v-model value again.

### `v-model:suggestion`

- **Type:** `object | undefined`

The _v-model_ for the currently selected suggestion object. Provides easy access to the object and works both ways — you can set an "initial" suggestion on page-load without an extra API call. When a non-empty object is set from outside, the v-model for the query text will also be updated.

## Props {#props}

<ComponentSchema lang="en" />

## Emitted events {#emits}

| Event         | When emitted                                                                                                     | Event payload type                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `@error`      | In case of any error                                                                                             | `unknown`                                    |
| `@select`     | When a suggestion is selected, either by click, by pressing "Enter", or automatically when `selectOnBlur`=`true` | `(suggestion: object, selectType: string)`   |
| `@enriched`   | When selected suggestion was enriched (when `enrichOnSelect`=`true`)                                             | `(suggestion: object, diff: object \| null)` |
| `@enrichFail` | When attemp to enrich selected suggestion fails (when `enrichOnSelect`=`true`)                                   | `string` (_suggestion.unrestricted_value_)   |
| `@focus`      | When input is focused                                                                                            | `FocusEvent`                                 |
| `@blur`       | When input looses focus                                                                                          | `FocusEvent`                                 |

## Slots {#slots}

> _The props of each slot receive `mergedClasses` — an object containing all the CSS classes used by the component, in the same format as the object for the [`classes`](#classes) prop on the component (`VueDadataClasses`)._

### inputWrapper

A slot for replacing the main visible container with the input field, including the `<input>` and the “clear” button.

The following props are passed to the slot:

- `coreInputProps` — recommended to `v-bind` fully to your own `input`. Includes essential event handlers required by the component: `@input`, `@keydown`, `@focus`, `@blur`, as well as the `disabled` attribute and `value`, which **does not always match the text in `query`**, as it may contain the currently visible text when navigating suggestions via keyboard.
- `browserAutoProps` — attributes for disabling browser features that interfere with normal usage: autofill, autocomplete, autocorrect, and spellcheck.
- `allInputProps` — includes everything from `coreInputProps` and `browserAutoProps`, plus the attributes `type`, `class`, `name`, and `placeholder`.
- `mergedClasses` — the CSS classes used by the component.

Example usage:

```vue
<template #inputWrapper="{ allInputProps, coreInputProps, browserAutoProps }">
  <!-- Your custom input/wrapper/anything -->
  <MyFancyInput
    v-bind="{ ...coreInputProps, ...browserAutoProps }"
    :placeholder="allInputProps.placeholder"
  />
</template>
```

If desired, `<input>` can be replaced with `<textarea>` (bind `coreInputProps` the props to it in the same way).

### input

Replaces only the `<input>`, without affecting the parent container or the overlay with the “clear” button. The slot props are the same as for [`inputWrapper`](#inputwrapper). Example:

```vue
<template #input="{ allInputProps, coreInputProps, browserAutoProps }">
  <textarea v-bind="allInputProps" />
</template>
```

### inputOverlay

An empty slot that allows you to add custom elements inside the container with the `input`, such as a loading indicator, buttons, etc. There are no props except `mergedClasses`. Example:

```vue
<template #inputOverlay>
  <!-- Custom loading spinner, icons, buttons, etc -->
</template>
```

### clearButtonIcon

Replaces the icon of the built-in “clear” (×) button without affecting the `<button>` element itself. There are no props except `mergedClasses`. Example:

```vue
<template #clearButtonIcon>
  <svg><!-- Custom "clear" icon --></svg>
</template>
```

### hint

This slot replaces the "hint" text shown above the suggestions list inside the dropdown and allows you to add custom elements to display there when suggestions are present, or instead of the list when nothing is found. For example, you can add a link or a button like "Reset filters," or apply custom styling to the `suggestionsHint` message (like “Choose an option or continue typing...”).

The container has `@mousedown.prevent` applied to prevent losing focus and hiding the dropdown when clicking inside the container.

To keep the dropdown visible when no suggestions are found, pass `true` to the component’s `noSuggestionsHint` prop.

Slot props:

- `suggestionsList` — the current suggestions list
- `suggestionsHint` — the hint text when suggestions are present (default or from the component's `suggestionsHint` prop)
- `noSuggestionsHint` — the hint text when no suggestions are found (from the component's `noSuggestionsHint` prop)
- `mergedClasses` — the CSS classes used by the component

Example:

```vue
<!-- <VueDadata :noSuggestionsHint="true" ...> -->

<template #hint="{ suggestionsList, suggestionsHint, noSuggestionsHint }">
  <!-- Default message when suggestions are found -->
  <template v-if="suggestionsList.length"> {{ suggestionsHint }} </template>

  <!-- Custom block when no suggestions are available -->
  <template v-else>
    Nothing found...
    <button @click="reset">Reset filters?</button>
  </template>
</template>
```

### suggestions

Replaces the entire suggestions list (without affecting [`hint`](#hint) and the dropdown container itself).

Slot props:

- `suggestionsList` — an array of suggestion objects
- `navigatedIndex` — the index of the navigated suggestion (when navigating via keyboard)
- `handleSuggestionClick` — a click handler that must be added to each suggestion item to ensure full component functionality (add it with `@mousedown.prevent="..."`)
- `mergedClasses` — the CSS classes used by the component

Example:

```vue
<template #suggestions="{ suggestionsList, navigatedIndex, handleSuggestionClick }">
  <div
    v-for="(suggestion, index) in suggestionsList"
    :key="index"
    @mousedown.prevent="handleSuggestionClick(index)"
  >
    {{ suggestion.value }}
  </div>
</template>
```

### suggestionItem

Replaces whole suggestion item (including its container).

Slot props:

- `suggestion` — the suggestion object
- `index` — the index of the item in the list (starting from `0`)
- `isNavigated` — whether this item is currently “highlighted” (during keyboard navigation)
- `handleSuggestionClick` — a click handler that must be added to each suggestion item to ensure full component functionality (add it with `@mousedown.prevent="..."`)
- `mergedClasses` — the CSS classes used by the component

Example:

```vue
<template #suggestionItem="{ suggestion, index, isNavigated, handleSuggestionClick }">
  <button @mousedown.prevent="handleSuggestionClick(index)">
    {{ suggestion.value }}
  </button>
</template>
```

### suggestionItemContent

Replaces the inner content of each suggestion item in the list, without affecting its parent container. The props are the same as for [`suggestionItem`](#suggestionitem), except for `handleSuggestionClick`.

```vue
<template #suggestionItemContent="{ suggestion, index, isNavigated }">
  {{ suggestion.value }}
</template>
```

### suggestionItemTitle

Replaces the element displaying the main text of the suggestion (`suggestion.value`). When using this slot, you’ll probably want to implement your own search text match highlighting — to get the highlighted chunks, you can use the `highlightChunks` function exported by the library.

The slot props are the same as for [`suggestionItem`](#suggestionitem), except for `handleSuggestionClick`.

```vue
<template #suggestionItemTitle="{ suggestion, index, isNavigated }">
  <!-- Show `unrestricted_value` instead of `value` (with custom `highlight`) -->
  <span v-html="highlight(query, suggestion.unrestricted_value)" />
</template>
```

### suggestionItemSubtitle

Replaces the element used to display additional text below the main suggestion text. The default slot content appears only in certain cases, such as suggestions for `party` or `bank`, but this slot allows you to show extra info at any time.

The props are the same as for [`suggestionItem`](#suggestionitem), except for `handleSuggestionClick`.

```vue
<template #suggestionItemSubtitle="{ suggestion, isNavigated }">
  <div class="...">{{ suggestion.data.inn }}</div>
</template>
```

## Exposed Component API {#methods}

The following methods and properties are available via the component's template ref (`<VueDadata ref="vueDadata" ... />`):

| Name                | Type                                          | Description                                                                                                                                                              |
| ------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `inputRef`          | `ShallowRef\<HTMLInputElement \| null>\`      | `templateRef` of the `<input>` element                                                                                                                                   |
| `suggestionsList`   | `Ref<DadataSuggestion[], DadataSuggestion[]>` | The current list of suggestions or an empty array                                                                                                                        |
| `isDropdownVisible` | `ComputedRef<boolean>`                        | `true` when the suggestion list is visible                                                                                                                               |
| `isFocused`         | `ComputedRef<boolean>`                        | `true` when the `<input>` is focused                                                                                                                                     |
| `update()`          | `(options) => DadataSuggestion[]`             | Sends an API request and updates the suggestions list. You can pass options to override the ones set via props. Returns fetched suggestions list or throws on any error. |
| `clear()`           | `() => void`                                  | Clears the query text (`modelValue`), `v-model:suggestion`, and `suggestionsList`                                                                                        |
| `show()`            | `() => void`                                  | Shows the dropdown (if there are suggestions available)                                                                                                                  |
| `hide()`            | `() => void`                                  | Hides the dropdown                                                                                                                                                       |
| `focus()`           | `() => void`                                  | Focuses the `<input>`                                                                                                                                                    |
| `blur()`            | `() => void`                                  | Removes focus from the `<input>`                                                                                                                                         |

#### Methods usage example {#methods-usage}

<!-- @include: ../vue-usage-methods.md -->

## Dependencies {#deps}

#### Internal {#internal-deps}

- [axios](https://github.com/axios/axios)
- [@vueuse/core](https://vueuse.org/)

#### Peer dependencies {#peer-deps}

- [Vue 3](https://github.com/vuejs/vue)
