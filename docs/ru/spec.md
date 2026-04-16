---
title: OpenAPI спецификация Dadata
outline: [1, 4]
---

<script setup>
import OpenApiContent from '../components/OpenApiContent.vue'
</script>

::: info
Эта документация была разработана в 2025 году, когда официальная OpenAPI спецификация ещё не была опубликована.
С тех пор (по состоянию на март 2026) многое изменилось, и хотя данная неофициальная документация по прежнему полезна, она требует обновления. Если хотите помочь, присоединяйтесь [на GitHub](https://github.com/alexchexes/dadata-sdk).

---

Офицальные OpenAPI-схемы:</br>

1. [cleaner.yml](https://dadata.ru/files/openapi/cleaner.yml) — «Стандартизация». Методы clean/address, clean/phone и аналогичные. </br>
2. [suggestions.yml](https://dadata.ru/files/openapi/suggestions.yml) — «Подсказки» и поиск. Методы suggest, findById, geolocate и другие. </br>
3. [profile.yml](https://dadata.ru/files/openapi/profile.yml) — личный кабинет. Баланс, статистика, версии.

:::

::: warning

Документация находится на ранней стадии разработки. Сайт может часто меняться, но мы постараемся сделать его как можно более удобным.

[Нажмите здесь](https://github.com/alexchexes/dadata-sdk), чтобы перейти на GitHub, если хотите помочь.

:::

<OpenApiContent>
<OAInfo />
<OAServers />
</OpenApiContent>
