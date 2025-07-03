---
outline: [2, 4]
---

# List of DaData APIs

## By endpoint type

### Suggest

List of suggest types on Dadata website: https://dadata.ru/api/suggest/

Base URL: https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest

| Searched entity                      | Docs                                                                                                                                                                         | API URL                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Address**                          | [[1]](https://dadata.ru/api/suggest/address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107)+[[3]](https://dadata.ru/suggestions/usage/address/) | [`suggest/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address)           |
| **FIAS**                             | [[1]](https://dadata.ru/api/suggest/fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953)+[[3]](https://dadata.ru/suggestions/usage/fias/)       | [`suggest/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fias)                 |
| **Legal entity RU**                  | [[1]](https://dadata.ru/api/suggest/party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669122)+[[3]](https://dadata.ru/suggestions/usage/party/)     | [`suggest/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party)               |
| **Legal entity BY**                  | [[1]](https://dadata.ru/api/suggest/party_by/)                                                                                                                               | [`suggest/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_by)         |
| **Legal entity KZ**                  | [[1]](https://dadata.ru/api/suggest/party_kz/)                                                                                                                               | [`suggest/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz)         |
| **Bank**                             | [[1]](https://dadata.ru/api/suggest/bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996078)+[[3]](https://dadata.ru/suggestions/usage/bank/)       | [`suggest/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank)                 |
| **Name**                             | [[1]](https://dadata.ru/api/suggest/name/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669115)                                                        | [`suggest/fio`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio)                   |
| **Email**                            | [[1]](https://dadata.ru/api/suggest/email/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=234782803)+[[3]](https://dadata.ru/suggestions/usage/email/)     | [`suggest/email`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email)               |
| **FMS unit**                         | [[1]](https://dadata.ru/api/suggest/fms_unit/)                                                                                                                               | [`suggest/fms_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit)         |
| **Postal unit**                      | [[1]](https://dadata.ru/api/suggest/postal_unit/)                                                                                                                            | [`suggest/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit)   |
| **Tax office unit**                  | [[1]](https://dadata.ru/api/suggest/fns_unit/)                                                                                                                               | [`suggest/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fns_unit)         |
| **Customs unit**                     | [[1]](https://dadata.ru/api/suggest/fts_unit/)                                                                                                                               | [`suggest/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fts_unit)         |
| **Region court**                     | [[1]](https://dadata.ru/api/suggest/region_court/)                                                                                                                           | [`suggest/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/region_court) |
| **Metro station**                    | [[1]](https://dadata.ru/api/suggest/metro/)                                                                                                                                  | [`suggest/metro`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro)               |
| **Car brand**                        | [[1]](https://dadata.ru/api/suggest/car_brand/)                                                                                                                              | [`suggest/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/car_brand)       |
| **Country**                          | [[1]](https://dadata.ru/api/suggest/country/)                                                                                                                                | [`suggest/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country)           |
| **Currency**                         | [[1]](https://dadata.ru/api/suggest/currency/)                                                                                                                               | [`suggest/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/currency)         |
| **ICGS - Goods and services**        | [[1]](https://dadata.ru/api/suggest/mktu/)                                                                                                                                   | [`suggest/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/mktu)                 |
| **OKVED 2 — Economic activity type** | [[1]](https://dadata.ru/api/suggest/okved2/)                                                                                                                                 | [`suggest/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okved2)             |
| **OKPD 2 — Product classification**  | [[1]](https://dadata.ru/api/suggest/okpd2/)                                                                                                                                  | [`suggest/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2)               |
| **OKTMO — Municipal entity**         | [[1]](https://dadata.ru/api/suggest/oktmo/)                                                                                                                                  | [`suggest/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/oktmo)               |

### Search by ID

Base URL: https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById

| Search type                          | Docs                                                                                                                  | API URL                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Address**                          | [[1]](https://dadata.ru/api/find-address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=312016944) | [`findById/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/address)           |
| **FIAS**                             | [[1]](https://dadata.ru/api/find-fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835965)    | [`findById/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fias)                 |
| **Legal entity RU**                  | [[1]](https://dadata.ru/api/find-party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058)   | [`findById/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party)               |
| **Legal entity BY**                  | [[1]](https://dadata.ru/api/suggest/party_by/)                                                                        | [`findById/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_by)         |
| **Legal entity KZ**                  | [[1]](https://dadata.ru/api/suggest/party_kz/)                                                                        | [`findById/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_kz)         |
| **Bank**                             | [[1]](https://dadata.ru/api/find-bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=820117560)    | [`findById/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank)                 |
| **Postal unit**                      | [[1]](https://dadata.ru/api/suggest/postal_unit/)                                                                     | [`findById/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/postal_unit)   |
| **Tax office unit**                  | [[1]](https://dadata.ru/api/suggest/fns_unit/)                                                                        | [`findById/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fns_unit)         |
| **Customs unit**                     | [[1]](https://dadata.ru/api/suggest/fts_unit/)                                                                        | [`findById/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fts_unit)         |
| **Region court**                     | [[1]](https://dadata.ru/api/suggest/region_court/)                                                                    | [`findById/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/region_court) |
| **Car brand**                        | [[1]](https://dadata.ru/api/suggest/car_brand/)                                                                       | [`findById/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/car_brand)       |
| **Country**                          | [[1]](https://dadata.ru/api/suggest/country/)                                                                         | [`findById/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/country)           |
| **Currency**                         | [[1]](https://dadata.ru/api/suggest/currency/)                                                                        | [`findById/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/currency)         |
| **ICGS - Goods and services**        | [[1]](https://dadata.ru/api/suggest/mktu/)                                                                            | [`findById/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/mktu)                 |
| **OKVED 2 — Economic activity type** | [[1]](https://dadata.ru/api/suggest/okved2/)                                                                          | [`findById/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okved2)             |
| **OKPD 2 — Product classification**  | [[1]](https://dadata.ru/api/suggest/okpd2/)                                                                           | [`suggest/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2)                 |
| **OKTMO — Municipal entity**         | [[1]](https://dadata.ru/api/suggest/oktmo/)                                                                           | [`findById/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/oktmo)               |
| **Delivery service city ID**         | [[1]](https://dadata.ru/api/delivery/)                                                                                | [`findById/delivery`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/delivery)         |

### Standartization

List of standartization types on Dadata website: https://dadata.ru/api/clean/

Base URL: https://cleaner.dadata.ru/api/v1/clean

| Standartization type  | Docs                                          | API URL                                                               |
| --------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| **Address**           | [[1]](https://dadata.ru/api/clean/address/)   | [`clean/address`](https://cleaner.dadata.ru/api/v1/clean/address)     |
| **Name**              | [[1]](https://dadata.ru/api/clean/name/)      | [`clean/name`](https://cleaner.dadata.ru/api/v1/clean/name)           |
| **Email**             | [[1]](https://dadata.ru/api/clean/email/)     | [`clean/email`](https://cleaner.dadata.ru/api/v1/clean/email)         |
| **Phones**            | [[1]](https://dadata.ru/api/clean/phone/)     | [`clean/phone`](https://cleaner.dadata.ru/api/v1/clean/phone)         |
| **Passport check**    | [[1]](https://dadata.ru/api/clean/passport/)  | [`clean/passport`](https://cleaner.dadata.ru/api/v1/clean/passport)   |
| **Dates**             | [[1]](https://dadata.ru/api/clean/birthdate/) | [`clean/birthdate`](https://cleaner.dadata.ru/api/v1/clean/birthdate) |
| **Car brand & model** | [[1]](https://dadata.ru/api/clean/vehicle/)   | [`clean/vehicle`](https://cleaner.dadata.ru/api/v1/clean/vehicle)     |
| **Combined records**  | [[1]](https://dadata.ru/api/clean/record/)    | [`clean`](https://cleaner.dadata.ru/api/v1/clean)                     |

### Other APIs

| DaData service                 | Docs                                                                                                                     | API URL                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Address by coordinates**     | [[1]](https://dadata.ru/api/geolocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=808583277)       | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address)         |
| **City by IP address**         | [[1]](https://dadata.ru/api/iplocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669119)        | [`suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address)           |
| **Postal unit by coordinates** | [[1]](https://dadata.ru/api/suggest/postal_unit/)                                                                        | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit) |
| **Affiliated companies**       | [[1]](https://dadata.ru/api/find-affiliated/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=978026645) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party)   |
| **Company by email**           | [[1]](https://dadata.ru/api/find-company/by-email/)                                                                      | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company)     |

### Account API

| Account data             | API URL                               |                                                                                |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------ |
| **Usage**                | [[1]](https://dadata.ru/api/stat/)    | [`dadata.ru/api/v2/stat/daily`](https://dadata.ru/api/v2/stat/daily)           |
| **Account balance**      | [[1]](https://dadata.ru/api/balance/) | [`dadata.ru/api/v2/profile/balance`](https://dadata.ru/api/v2/profile/balance) |
| **Directories versions** | [[1]](https://dadata.ru/api/version/) | [`dadata.ru/api/v2/version`](https://dadata.ru/api/v2/version)                 |

## By directory type

### Address

|                                  |                                                                                                                                                                              |                                                                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions**                  | [[1]](https://dadata.ru/api/suggest/address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669107)+[[3]](https://dadata.ru/suggestions/usage/address/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address)     |
| **Address by ID**                | [[1]](https://dadata.ru/api/find-address/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=312016944)                                                        | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/address)   |
| **Address by coordinates**       | [[1]](https://dadata.ru/api/geolocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=808583277)                                                           | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address) |
| **City by IP-address**           | [[1]](https://dadata.ru/api/iplocate/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669119)                                                            | [`suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address)   |
| **City ID in delivery services** | [[1]](https://dadata.ru/api/delivery/)                                                                                                                                       | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/delivery`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/delivery) |
| **Standartization**              | [[1]](https://dadata.ru/api/clean/address/)                                                                                                                                  | [`cleaner.dadata.ru/api/v1/clean/address`](https://cleaner.dadata.ru/api/v1/clean/address)                                                 |

### FIAS

|                 |                                                                                                                                                                        |                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835953)+[[3]](https://dadata.ru/suggestions/usage/fias/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fias)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/find-fias/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=967835965)                                                     | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fias`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fias) |

### Legal entity RU

|                          |                                                                                                                                                                          |                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions**          | [[1]](https://dadata.ru/api/suggest/party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669122)+[[3]](https://dadata.ru/suggestions/usage/party/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party)               |
| **Find by ID**           | [[1]](https://dadata.ru/api/find-party/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=568918058)                                                      | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party)             |
| **Affiliated companies** | [[1]](https://dadata.ru/api/find-affiliated/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=978026645)                                                 | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findAffiliated/party) |
| **Company by email**     | [[1]](https://dadata.ru/api/find-company/by-email/)                                                                                                                      | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findByEmail/company)   |

### Legal entity BY

|                 |                                                |                                                                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/party_by/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_by)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/party_by/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_by`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_by) |

### Legal entity KZ

|                 |                                                |                                                                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/party_kz/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party_kz)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/party_kz/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_kz`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party_kz) |

### Bank

|                 |                                                                                                                                                                        |                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996078)+[[3]](https://dadata.ru/suggestions/usage/bank/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/find-bank/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=820117560)                                                     | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank) |

### Name

|                     |                                                                                                                       |                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions**     | [[1]](https://dadata.ru/api/suggest/name/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669115) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio) |
| **Standartization** | [[1]](https://dadata.ru/api/clean/name/)                                                                              | [`cleaner.dadata.ru/api/v1/clean/name`](https://cleaner.dadata.ru/api/v1/clean/name)                                           |

### Email

|                     |                                                                                                                                                                          |                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions**     | [[1]](https://dadata.ru/api/suggest/email/)+[[2]](https://confluence.hflabs.ru/pages/viewpage.action?pageId=234782803)+[[3]](https://dadata.ru/suggestions/usage/email/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email) |
| **Standartization** | [[1]](https://dadata.ru/api/clean/email/)                                                                                                                                | [`cleaner.dadata.ru/api/v1/clean/email`](https://cleaner.dadata.ru/api/v1/clean/email)                                             |

### Phones

|                     |                                           |                                                                                        |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| **Standartization** | [[1]](https://dadata.ru/api/clean/phone/) | [`cleaner.dadata.ru/api/v1/clean/phone`](https://cleaner.dadata.ru/api/v1/clean/phone) |

### FMS unit

|                 |                                                |                                                                                                                                          |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/fms_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit) |

### Passport check

|                     |                                              |                                                                                              |
| ------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Standartization** | [[1]](https://dadata.ru/api/clean/passport/) | [`cleaner.dadata.ru/api/v1/clean/passport`](https://cleaner.dadata.ru/api/v1/clean/passport) |

### Dates

|                     |                                               |                                                                                                |
| ------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Standartization** | [[1]](https://dadata.ru/api/clean/birthdate/) | [`cleaner.dadata.ru/api/v1/clean/birthdate`](https://cleaner.dadata.ru/api/v1/clean/birthdate) |

### Postal unit

|                         |                                                   |                                                                                                                                                    |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions**         | [[1]](https://dadata.ru/api/suggest/postal_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit)     |
| **Find by ID**          | [[1]](https://dadata.ru/api/suggest/postal_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/postal_unit)   |
| **Find By coordinates** | [[1]](https://dadata.ru/api/suggest/postal_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/postal_unit) |

### Tax office unit

|                 |                                                |                                                                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/fns_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fns_unit)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/fns_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fns_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fns_unit) |

### Customs unit

|                 |                                                |                                                                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/fts_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fts_unit)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/fts_unit/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fts_unit`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/fts_unit) |

### Region court

|                 |                                                    |                                                                                                                                                    |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/region_court/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/region_court)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/region_court/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/region_court`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/region_court) |

### Metro station

|                 |                                             |                                                                                                                                    |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/metro/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/metro) |

### Car brand

|                 |                                                 |                                                                                                                                              |
| --------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/car_brand/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/car_brand)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/car_brand/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/car_brand`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/car_brand) |

### Car brand & model

|                     |                                             |                                                                                            |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Standartization** | [[1]](https://dadata.ru/api/clean/vehicle/) | [`cleaner.dadata.ru/api/v1/clean/vehicle`](https://cleaner.dadata.ru/api/v1/clean/vehicle) |

### Country

|                 |                                               |                                                                                                                                          |
| --------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/country/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/country/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/country`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/country) |

### Currency

|                 |                                                |                                                                                                                                            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/currency/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/currency)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/currency/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/currency`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/currency) |

### ICGS - Goods and services

|                 |                                            |                                                                                                                                    |
| --------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/mktu/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/mktu)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/mktu/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/mktu`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/mktu) |

### OKVED 2 — Economic activity type

|                 |                                              |                                                                                                                                        |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/okved2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okved2)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/okved2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okved2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okved2) |

### OKPD 2 — Product classification

|                 |                                             |                                                                                                                                      |
| --------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/okpd2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/okpd2)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/okpd2/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okpd2`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/okpd2) |

### OKTMO — Municipal entity

|                 |                                             |                                                                                                                                      |
| --------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Suggestions** | [[1]](https://dadata.ru/api/suggest/oktmo/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/oktmo)   |
| **Find by ID**  | [[1]](https://dadata.ru/api/suggest/oktmo/) | [`suggestions.dadata.ru/suggestions/api/4_1/rs/findById/oktmo`](https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/oktmo) |
