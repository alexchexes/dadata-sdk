---
outline: [2, 4]
---

# Список API сервисов «Дадаты»

## По типу эндпоинта

### Подсказки

Общая информация: https://dadata.ru/suggestions/

О подключении к разным проектам: https://dadata.ru/suggestions/usage/

Список типов подсказок на сайте Dadata: https://dadata.ru/api/suggest/

Базовый URL API: https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest

| Тип «подсказок»                       | Docs                                                                                                                                                                         | API URL                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Адреса**                            | [[1]](https://dadata.ru/api/suggest/address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107)+[[3]](https://dadata.ru/suggestions/usage/address/) | [`suggest/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address)           |
| **ФИАС**                              | [[1]](https://dadata.ru/api/suggest/fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953)+[[3]](https://dadata.ru/suggestions/usage/fias/)       | [`suggest/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fias)                 |
| **Компании РФ**                       | [[1]](https://dadata.ru/api/suggest/party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669122)+[[3]](https://dadata.ru/suggestions/usage/party/)     | [`suggest/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party)               |
| **Компании Беларуси**                 | [[1]](https://dadata.ru/api/suggest/party_by/)                                                                                                                               | [`suggest/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_by)         |
| **Компании Казахстана**               | [[1]](https://dadata.ru/api/suggest/party_kz/)                                                                                                                               | [`suggest/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz)         |
| **Банки**                             | [[1]](https://dadata.ru/api/suggest/bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996078)+[[3]](https://dadata.ru/suggestions/usage/bank/)       | [`suggest/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank)                 |
| **ФИО**                               | [[1]](https://dadata.ru/api/suggest/name/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669115)                                                        | [`suggest/fio`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio)                   |
| **Email**                             | [[1]](https://dadata.ru/api/suggest/email/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=234782803)+[[3]](https://dadata.ru/suggestions/usage/email/)     | [`suggest/email`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email)               |
| **Кем выдан паспорт**                 | [[1]](https://dadata.ru/api/suggest/fms_unit/)                                                                                                                               | [`suggest/fms_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit)         |
| **Почтовые отделения**                | [[1]](https://dadata.ru/api/suggest/postal_unit/)                                                                                                                            | [`suggest/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit)   |
| **Налоговые инспекции**               | [[1]](https://dadata.ru/api/suggest/fns_unit/)                                                                                                                               | [`suggest/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fns_unit)         |
| **Таможни**                           | [[1]](https://dadata.ru/api/suggest/fts_unit/)                                                                                                                               | [`suggest/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fts_unit)         |
| **Мировые суды**                      | [[1]](https://dadata.ru/api/suggest/region_court/)                                                                                                                           | [`suggest/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/region_court) |
| **Станции метро**                     | [[1]](https://dadata.ru/api/suggest/metro/)                                                                                                                                  | [`suggest/metro`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro)               |
| **Марки автомобилей**                 | [[1]](https://dadata.ru/api/suggest/car_brand/)                                                                                                                              | [`suggest/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/car_brand)       |
| **Страны**                            | [[1]](https://dadata.ru/api/suggest/country/)                                                                                                                                | [`suggest/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country)           |
| **Валюты**                            | [[1]](https://dadata.ru/api/suggest/currency/)                                                                                                                               | [`suggest/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/currency)         |
| **МКТУ (товары и услуги)**            | [[1]](https://dadata.ru/api/suggest/mktu/)                                                                                                                                   | [`suggest/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/mktu)                 |
| **ОКВЭД 2 (виды деятельности)**       | [[1]](https://dadata.ru/api/suggest/okved2/)                                                                                                                                 | [`suggest/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okved2)             |
| **ОКПД 2 (виды продукции)**           | [[1]](https://dadata.ru/api/suggest/okpd2/)                                                                                                                                  | [`suggest/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2)               |
| **ОКТМО (муниципальные образования)** | [[1]](https://dadata.ru/api/suggest/oktmo/)                                                                                                                                  | [`suggest/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/oktmo)               |

### Поиск по коду

Базовый URL: https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById

| Тип поиска                            | Docs                                                                                                                  | API URL                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Адрес**                             | [[1]](https://dadata.ru/api/find-address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=312016944) | [`findById/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/address)           |
| **ФИАС**                              | [[1]](https://dadata.ru/api/find-fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835965)    | [`findById/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fias)                 |
| **Компании РФ**                       | [[1]](https://dadata.ru/api/find-party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058)   | [`findById/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party)               |
| **Компании Беларуси**                 | [[1]](https://dadata.ru/api/suggest/party_by/)                                                                        | [`findById/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_by)         |
| **Компании Казахстана**               | [[1]](https://dadata.ru/api/suggest/party_kz/)                                                                        | [`findById/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_kz)         |
| **Банки**                             | [[1]](https://dadata.ru/api/find-bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=820117560)    | [`findById/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank)                 |
| **Почтовые отделения**                | [[1]](https://dadata.ru/api/suggest/postal_unit/)                                                                     | [`findById/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/postal_unit)   |
| **Налоговые инспекции**               | [[1]](https://dadata.ru/api/suggest/fns_unit/)                                                                        | [`findById/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fns_unit)         |
| **Таможни**                           | [[1]](https://dadata.ru/api/suggest/fts_unit/)                                                                        | [`findById/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fts_unit)         |
| **Мировые суды**                      | [[1]](https://dadata.ru/api/suggest/region_court/)                                                                    | [`findById/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/region_court) |
| **Марки автомобилей**                 | [[1]](https://dadata.ru/api/suggest/car_brand/)                                                                       | [`findById/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/car_brand)       |
| **Страны**                            | [[1]](https://dadata.ru/api/suggest/country/)                                                                         | [`findById/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/country)           |
| **Валюты**                            | [[1]](https://dadata.ru/api/suggest/currency/)                                                                        | [`findById/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/currency)         |
| **МКТУ (товары и услуги)**            | [[1]](https://dadata.ru/api/suggest/mktu/)                                                                            | [`findById/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/mktu)                 |
| **ОКВЭД 2 (виды деятельности)**       | [[1]](https://dadata.ru/api/suggest/okved2/)                                                                          | [`findById/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okved2)             |
| **ОКПД 2 (виды продукции)**           | [[1]](https://dadata.ru/api/suggest/okpd2/)                                                                           | [`findById/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okpd2)               |
| **ОКТМО (муниципальные образования)** | [[1]](https://dadata.ru/api/suggest/oktmo/)                                                                           | [`findById/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/oktmo)               |
| **ID города в службах доставки**      | [[1]](https://dadata.ru/api/delivery/)                                                                                | [`findById/delivery`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/delivery)         |

### Стандартизация

Общая информация: https://dadata.ru/clean/

Список типов стандартизации на сайте Dadata: https://dadata.ru/api/clean/

Базовый URL: https://cleaner.dadata.ru/api/v1/clean

| Тип стандартизации              | Docs                                          | API URL                                                               |
| ------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| **Адреса**                      | [[1]](https://dadata.ru/api/clean/address/)   | [`clean/address`](https://cleaner.dadata.ru/api/v1/clean/address)     |
| **ФИО**                         | [[1]](https://dadata.ru/api/clean/name/)      | [`clean/name`](https://cleaner.dadata.ru/api/v1/clean/name)           |
| **Email**                       | [[1]](https://dadata.ru/api/clean/email/)     | [`clean/email`](https://cleaner.dadata.ru/api/v1/clean/email)         |
| **Телефоны**                    | [[1]](https://dadata.ru/api/clean/phone/)     | [`clean/phone`](https://cleaner.dadata.ru/api/v1/clean/phone)         |
| **Проверка паспорта**           | [[1]](https://dadata.ru/api/clean/passport/)  | [`clean/passport`](https://cleaner.dadata.ru/api/v1/clean/passport)   |
| **Даты**                        | [[1]](https://dadata.ru/api/clean/birthdate/) | [`clean/birthdate`](https://cleaner.dadata.ru/api/v1/clean/birthdate) |
| **Марки и модели авто**         | [[1]](https://dadata.ru/api/clean/vehicle/)   | [`clean/vehicle`](https://cleaner.dadata.ru/api/v1/clean/vehicle)     |
| **Составные записи о человеке** | [[1]](https://dadata.ru/api/clean/record/)    | [`clean`](https://cleaner.dadata.ru/api/v1/clean)                     |

### Прочие API

| Сервис                                | Docs                                                                                                                     | API URL                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Адрес по координатам**              | [[1]](https://dadata.ru/api/geolocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=808583277)       | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address)         |
| **Город по IP-адресу**                | [[1]](https://dadata.ru/api/iplocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669119)        | [`suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address)           |
| **Почтовое отделение по координатам** | [[1]](https://dadata.ru/api/suggest/postal_unit/)                                                                        | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit) |
| **Аффилированные компании**           | [[1]](https://dadata.ru/api/find-affiliated/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=978026645) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party)   |
| **Компания по email**                 | [[1]](https://dadata.ru/api/find-company/by-email/)                                                                      | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company)     |

### API личного кабинета

| Данные из ЛК            | Docs                                  | API URL                                                                        |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| **Проверка лимитов**    | [[1]](https://dadata.ru/api/stat/)    | [`dadata.ru/api/v2/stat/daily`](https://dadata.ru/api/v2/stat/daily)           |
| **Баланс пользователя** | [[1]](https://dadata.ru/api/balance/) | [`dadata.ru/api/v2/profile/balance`](https://dadata.ru/api/v2/profile/balance) |
| **Версии справочников** | [[1]](https://dadata.ru/api/version/) | [`dadata.ru/api/v2/version`](https://dadata.ru/api/v2/version)                 |

## По типу справочника

### Адреса

|                                  |                                                                                                                                                                              |                                                                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**                    | [[1]](https://dadata.ru/api/suggest/address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107)+[[3]](https://dadata.ru/suggestions/usage/address/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address)     |
| **Адрес по коду**                | [[1]](https://dadata.ru/api/find-address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=312016944)                                                        | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/address)   |
| **Адрес по координатам**         | [[1]](https://dadata.ru/api/geolocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=808583277)                                                           | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address) |
| **Город по IP-адресу**           | [[1]](https://dadata.ru/api/iplocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669119)                                                            | [`suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address)   |
| **ID города в службах доставки** | [[1]](https://dadata.ru/api/delivery/)                                                                                                                                       | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/delivery`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/delivery) |
| **Стандартизация**               | [[1]](https://dadata.ru/api/clean/address/)                                                                                                                                  | [`cleaner.dadata.ru/api/v1/clean/address`](https://cleaner.dadata.ru/api/v1/clean/address)                                                 |

### ФИАС

|                   |                                                                                                                                                                        |                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953)+[[3]](https://dadata.ru/suggestions/usage/fias/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fias)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/find-fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835965)                                                     | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fias) |

### Компании РФ

|                             |                                                                                                                                                                          |                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**               | [[1]](https://dadata.ru/api/suggest/party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669122)+[[3]](https://dadata.ru/suggestions/usage/party/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party)               |
| **Поиск по коду**           | [[1]](https://dadata.ru/api/find-party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058)                                                      | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party)             |
| **Аффилированные компании** | [[1]](https://dadata.ru/api/find-affiliated/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=978026645)                                                 | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party) |
| **Компания по email**       | [[1]](https://dadata.ru/api/find-company/by-email/)                                                                                                                      | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company)   |

### Компании Беларуси

|                   |                                                |                                                                                                                                            |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/party_by/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_by)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/party_by/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_by) |

### Компании Казахстана

|                   |                                                |                                                                                                                                            |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/party_kz/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/party_kz/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_kz) |

### Банки

|                   |                                                                                                                                                                        |                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996078)+[[3]](https://dadata.ru/suggestions/usage/bank/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/find-bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=820117560)                                                     | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank) |

### ФИО

|                    |                                                                                                                       |                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**      | [[1]](https://dadata.ru/api/suggest/name/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669115) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio) |
| **Стандартизация** | [[1]](https://dadata.ru/api/clean/name/)                                                                              | [`cleaner.dadata.ru/api/v1/clean/name`](https://cleaner.dadata.ru/api/v1/clean/name)                                           |

### Email

|                    |                                                                                                                                                                          |                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**      | [[1]](https://dadata.ru/api/suggest/email/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=234782803)+[[3]](https://dadata.ru/suggestions/usage/email/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email) |
| **Стандартизация** | [[1]](https://dadata.ru/api/clean/email/)                                                                                                                                | [`cleaner.dadata.ru/api/v1/clean/email`](https://cleaner.dadata.ru/api/v1/clean/email)                                             |

### Телефоны

|                    |                                           |                                                                                        |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| **Стандартизация** | [[1]](https://dadata.ru/api/clean/phone/) | [`cleaner.dadata.ru/api/v1/clean/phone`](https://cleaner.dadata.ru/api/v1/clean/phone) |

### Кем выдан паспорт

|               |                                                |                                                                                                                                          |
| ------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки** | [[1]](https://dadata.ru/api/suggest/fms_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit) |

### Проверка паспорта

|                    |                                              |                                                                                              |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Стандартизация** | [[1]](https://dadata.ru/api/clean/passport/) | [`cleaner.dadata.ru/api/v1/clean/passport`](https://cleaner.dadata.ru/api/v1/clean/passport) |

### Даты

|                    |                                               |                                                                                                |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Стандартизация** | [[1]](https://dadata.ru/api/clean/birthdate/) | [`cleaner.dadata.ru/api/v1/clean/birthdate`](https://cleaner.dadata.ru/api/v1/clean/birthdate) |

### Почтовые отделения

|                    |                                                   |                                                                                                                                                    |
| ------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**      | [[1]](https://dadata.ru/api/suggest/postal_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit)     |
| **Поиск по коду**  | [[1]](https://dadata.ru/api/suggest/postal_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/postal_unit)   |
| **По координатам** | [[1]](https://dadata.ru/api/suggest/postal_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit) |

### Налоговые инспекции

|                   |                                                |                                                                                                                                            |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/fns_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fns_unit)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/fns_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fns_unit) |

### Таможни

|                   |                                                |                                                                                                                                            |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/fts_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fts_unit)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/fts_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fts_unit) |

### Мировые суды

|                   |                                                    |                                                                                                                                                    |
| ----------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/region_court/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/region_court)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/region_court/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/region_court) |

### Станции метро

|               |                                             |                                                                                                                                    |
| ------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки** | [[1]](https://dadata.ru/api/suggest/metro/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro) |

### Марки авто

|                   |                                                 |                                                                                                                                              |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/car_brand/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/car_brand)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/car_brand/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/car_brand) |

### Марки и модели авто

|                    |                                             |                                                                                            |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Стандартизация** | [[1]](https://dadata.ru/api/clean/vehicle/) | [`cleaner.dadata.ru/api/v1/clean/vehicle`](https://cleaner.dadata.ru/api/v1/clean/vehicle) |

### Страны

|                   |                                               |                                                                                                                                          |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/country/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/country/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/country) |

### Валюты

|                   |                                                |                                                                                                                                            |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/currency/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/currency)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/currency/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/currency) |

### МКТУ (товары и услуги)

|                   |                                            |                                                                                                                                    |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/mktu/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/mktu)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/mktu/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/mktu) |

### ОКВЭД 2 (виды деятельности)

|                   |                                              |                                                                                                                                        |
| ----------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/okved2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okved2)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/okved2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okved2) |

### ОКПД 2 (виды продукции)

|                   |                                             |                                                                                                                                      |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/okpd2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/okpd2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okpd2) |

### ОКТМО (муниципальные образования)

|                   |                                             |                                                                                                                                      |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Подсказки**     | [[1]](https://dadata.ru/api/suggest/oktmo/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/oktmo)   |
| **Поиск по коду** | [[1]](https://dadata.ru/api/suggest/oktmo/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/oktmo) |
