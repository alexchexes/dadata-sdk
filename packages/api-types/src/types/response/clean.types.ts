import type { AddressClean } from './address.types';
import type { EmailClean } from './email.types';
import type { FioClean } from './fio.types';
import type { PassportClean } from './passport.types';
import type { PhoneClean } from './phone.types';
import type { VehicleClean } from './vehicle.types';

export type CleanFieldType = 'ADDRESS' | 'PHONE' | 'PASSPORT' | 'NAME' | 'EMAIL' | 'VEHICLE';

/**
 * Составная запись с контактными данными
 * https://dadata.ru/api/clean/record/
 */
export interface CleanCombinedRecord {
  /**
   * Структура записи – структура данных в `data`
   */
  structure: CleanFieldType[];
  /**
   * Массив с одним элементом – массивом, внутри которого каждый элемент
   * – это одна из стандартизированных частей записи. Какая именно - определяется структурой в поле `structure`.
   */
  data: [(AddressClean | PhoneClean | PassportClean | FioClean | EmailClean | VehicleClean)[]];
}
