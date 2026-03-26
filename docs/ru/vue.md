---
outline: [2, 3]
---

<script setup lang="ts">
import ComponentSchema from '../components/ComponentSchema.vue'
</script>

# Компонент DaData-подсказок для Vue 3.

Попробуйте демо, чтобы ознакомиться с возможностями компонента:

### [Демо](/ru/demo) {#demo}

## Установка {#installation}

```bash
npm i @dadata-sdk/vue
```

Или

```bash
pnpm i @dadata-sdk/vue
```

Или напрямую из последнего коммита на GitHub:

```bash
pnpm add @dadata-sdk/vue@github:alexchexes/dadata-sdk#rewritten&path:/packages/vue-dadata
```

## Использование {#usage}

<!-- @include: ../vue-usage-basic.md -->

## V-Models {#v-models}

### `v-model`

- **Обязательный**
- **Тип:** `string`

_v‑model_ для текста запроса. Значение используется при вызовах API и синхронизировано с полем ввода (`<input>`) всё время, кроме как при навигации по подсказкам с клавиатуры (клавишами ↑↓) — в этот момент поле ввода отображает текст из «подсвеченной» в данный момент подсказки, а значение v-model сохраняет текст, который был в поле до начала навигации. После выбора подсказки или выхода (_Esc_, Клик вне элемента), поле снова синхронизировано со значением в данном v-model.

### `v-model:suggestion`

- **Тип:** `object | undefined`

_v‑model_ для объекта выбранной в данный момент подсказки. Обеспечивает простой доступ к объекту, но работает в обе стороны — можно задать «начальную» подсказку при загрузке страницы без необходимости вызывать API. При установке непустого объекта извне, будет также обновлён v-model текста запроса.

## Пропсы {#props}

<ComponentSchema lang="ru" />

## События компонента {#emits}

| Событие       | Когда                                                                                          | Что передаётся                               |
| ------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `@error`      | В случае любой ошибки                                                                          | `unknown`                                    |
| `@select`     | Подсказка выбрана (по клику, по нажатию "Enter", или автоматически если `selectOnBlur`=`true`) | `(suggestion: object, selectType: string)`   |
| `@enriched`   | Дополнительные данные об адресе получены (если `enrichOnSelect`=`true`)                        | `(suggestion: object, diff: object \| null)` |
| `@enrichFail` | Не удалось получить дополнительные данные об адресе (если `enrichOnSelect`=`true`)             | `string` (_suggestion.unrestricted_value_)   |
| `@focus`      | Поле ввода получило фокус                                                                      | `FocusEvent`                                 |
| `@blur`       | Поле ввода потеряло фокус                                                                      | `FocusEvent`                                 |

## Слоты {#slots}

> _В пропсы каждого слота передаётся `mergedClasses` - объект со всеми используемыми компонентом CSS-классами в том же формате, что и объект для пропса [`classes`](#classes) на компоненте (`VueDadataClasses`)._

### inputWrapper

Слот для замены основного видимого контейнера с полем ввода, включающего `<input>` и кнопку-«крестик».

В пропсы слота передаются:

- `coreInputProps` - рекомендуется забиндить на свой `input` полностью через `v-bind`. Включает базовые необходимые компоненту обработчики событий `@input`, `@keydown`, `@focus`, `@blur`, а также атрибут `disabled`, и `value`, который **не всегда соответствует тексту в `query`**, поскольку может содержать текущий видимый текст при навигации по подсказкам клавиатурой.
- `browserAutoProps` - атрибуты для отключения функций браузера, мешающих взаимодействию: встроенных подсказок, автозаполнения, автокоррекции и проверки правописания.
- `allInputProps` - включает всё, что включено в `coreInputProps` и `browserAutoProps`, а также дополнительно, атрибуты `type`, `class`, `name`, и `placeholder`.
- `mergedClasses` - используемые компонентом CSS-классы.

Пример использования:

```vue
<template #inputWrapper="{ allInputProps, coreInputProps, browserAutoProps }">
  <!-- Your custom input/wrapper/anything -->
  <MyFancyInput
    v-bind="{ ...coreInputProps, ...browserAutoProps }"
    :placeholder="allInputProps.placeholder"
  />
</template>
```

При желании, `<input>` можно заменить на `<textarea>`, забиндив на неё все пропсы аналогичным образом.

### input

Заменяет только `<input>`, не трогая вышестоящий контейнер и оверлей с кнопкой-«крестиком». Пропсы слота те же, что для [`inputwrapper`](#inputwrapper). Пример:

```vue
<template #input="{ allInputProps, coreInputProps, browserAutoProps }">
  <textarea v-bind="allInputProps" />
</template>
```

### inputOverlay

Пустой слот, позволяющий добавить свои элементы внутри контейнера с `input`ом, например, индикатор загрузки, кнопки и подобное. Пропсов кроме `mergedClasses` нет. Пример:

```vue
<template #inputOverlay>
  <!-- Custom loading spinner, icons, buttons, etc -->
</template>
```

### clearButtonIcon

Заменяет иконку встроенной кнопки-«крестика» (×), не трогая сам элемент `<button>`. Пропсов кроме `mergedClasses` нет. Пример:

```vue
<template #clearButtonIcon>
  <svg><!-- Custom "clear" icon --></svg>
</template>
```

### hint

Слот позволяет добавить собственные элементы, отображаемые над списком подсказок при их наличии, либо вместо списка при их отсутствии. Например, здесь можно добавить ссылку или кнопку, когда подсказок не найдено, или свой дизайн сообщения "Выберите вариант или продолжите ввод...".

На контейнер добавлен `@mousedown.prevent`, чтобы исключить потерю фокуса и скрытие списка подсказок при кликах внутри контейнера.

Чтобы контейнер оставался видимым, когда подсказки не найдены, необходимо передать `true` в пропс компонента `noSuggestionsHint`.

Пропсы слота:

- `suggestionsList` - текущий список подсказок
- `suggestionsHint` - текст сообщения при наличии подсказок (дефолтное или из пропса `suggestionsHint` компонента)
- `noSuggestionsHint` - текст сообщения при отсутствии подсказок (из пропса `noSuggestionsHint` компонента)
- `mergedClasses` - используемые компонентом CSS-классы.

Пример:

```vue
<!-- <VueDadata :noSuggestionsHint="true" ...> -->

<template #hint="{ suggestionsList, suggestionsHint, noSuggestionsHint }">
  <!-- Стандартное сообщение если подсказки найдены -->
  <template v-if="suggestionsList.length"> {{ suggestionsHint }} </template>

  <!-- Свой блок если подсказок нет -->
  <template v-else>
    Ничего нет...
    <button @click="reset">Сбросить фильтры?</button>
  </template>
</template>
```

### suggestions

Заменяет полностью список подсказок (не трогая сам контейнер выпадающего списка и [`hint`](#hint)).

Пропсы слота:

- `suggestionsList` - Массив из объектов подсказок
- `navigatedIndex` - Индекс "подсвеченной" подсказки (при навигации клавиатурой)
- `handleSuggestionClick` - Обработчик клика, который необходимо добавить на каждый элемент подсказки, чтобы функции компонента продолжали работать в полном объёме (используйте `@mousedown.prevent="..."`)
- `mergedClasses` - используемые компонентом CSS-классы.

Пример:

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

Заменяет каждый отдельный элемент списка подсказок (включая его контейнер).

Пропсы слота:

- `suggestion` - объект подсказки
- `index` - индекс элемента в списке (с `0`)
- `isNavigated` - является ли данный элемент "подсвеченным" (при навигации клавиатурой)
- `handleSuggestionClick` - Обработчик клика, который необходимо добавить на ваш элемент подсказки, чтобы функции компонента продолжали работать в полном объёме (используйте `@mousedown.prevent="..."`)
- `mergedClasses` - используемые компонентом CSS-классы.

Пример:

```vue
<template #suggestionItem="{ suggestion, index, isNavigated, handleSuggestionClick }">
  <button @mousedown.prevent="handleSuggestionClick(index)">
    {{ suggestion.value }}
  </button>
</template>
```

### suggestionItemContent

Заменяет внутренний контент каждого элемента в списке подсказок, не трогая его родительский контейнер. Пропсы те же, что для [`suggestionItem`](#suggestionitem), но без `handleSuggestionClick`.

```vue
<template #suggestionItemContent="{ suggestion, index, isNavigated }">
  {{ suggestion.value }}
</template>
```

### suggestionItemTitle

Заменяет элемент с основным отображаемым текстом подсказки (`suggestion.value`). При использовании слота понадобится добавить собственную подсветку совпадений; чтобы получить размеченные части для подсветки можно использовать экспортируемую библиотекой функцию `highlightChunks`.

Пропсы слота те же, что для [`suggestionItem`](#suggestionitem), но без `handleSuggestionClick`.

```vue
<template #suggestionItemTitle="{ suggestion, index, isNavigated }">
  <!-- Show `unrestricted_value` instead of `value` (with custom `highlight`) -->
  <span v-html="highlight(query, suggestion.unrestricted_value)" />
</template>
```

### suggestionItemSubtitle

Заменяет элемент для размещения дополнительного текста под основным текстом подсказки. Дефолтный контент слота отображается только в определённых случаях, например для подсказок по организациям или банкам, слот же позволяет выводить дополнительное инфо в любой момент.

Пропсы те же, что для [`suggestionItem`](#suggestionitem), но без `handleSuggestionClick`.

```vue
<template #suggestionItemSubtitle="{ suggestion, index, isNavigated }">
  <div :class="mergedClasses.suggestionSubtitle">
    Фед. округ: {{ (suggestion.data as AddressAdminData).federal_district }}
  </div>
</template>
```

## Методы и свойства компонента {#methods}

Следующие методы и свойства доступны через template-ref компонента (`<VueDadata ref='vueDadata' ... />`):

| Name                | Type                                          | Description                                                                                                                                                                                                                            |
| ------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputRef`          | `ShallowRef<HTMLInputElement \| null>`        | `templateRef` элемента `<input>`                                                                                                                                                                                                       |
| `suggestionsList`   | `Ref<DadataSuggestion[], DadataSuggestion[]>` | Текущий список подсказок или пустой массив                                                                                                                                                                                             |
| `isDropdownVisible` | `ComputedRef<boolean>`                        | `true` когда список подсказок показан                                                                                                                                                                                                  |
| `isFocused`         | `ComputedRef<boolean>`                        | `true` когда `<input>` имеет фокус                                                                                                                                                                                                     |
| `update()`          | `(options) => DadataSuggestion[]`             | Отправить запрос и обновить список подсказок. В аргументе можно передать опции, которые перезапишут опции, переданные, установленные через пропсы. Возвращает полученный список подсказок, или выбрасывает исключение в случае ошибки. |
| `clear()`           | `() => void`                                  | Очистить текст запроса (`modelValue`), `v-model:suggestion` и `suggestionsList`                                                                                                                                                        |
| `show()`            | `() => void`                                  | Показать подсказки (если они в этот момент загружены)                                                                                                                                                                                  |
| `hide()`            | `() => void`                                  | Скрыть подсказки                                                                                                                                                                                                                       |
| `focus()`           | `() => void`                                  | Передать фокус `<input>`                                                                                                                                                                                                               |
| `blur()`            | `() => void`                                  | Убрать фокус с `<input>`                                                                                                                                                                                                               |

#### Пример использования методов {#methods-usage}

<!-- @include: ../vue-usage-methods.md -->

## Внешние зависимости {#deps}

#### Используется под капотом {#internal-deps}

- [axios](https://github.com/axios/axios)
- [@vueuse/core](https://vueuse.org/)

#### Ожидается у клиента (peer-deps) {#peer-deps}

- [Vue 3](https://github.com/vuejs/vue)
