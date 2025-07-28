import type { AddressClean } from './address.types';
import type { EmailClean } from './email.types';
import type { FioClean } from './fio.types';
import type { PassportClean } from './passport.types';
import type { PhoneClean } from './phone.types';
import type { VehicleClean } from './vehicle.types';

export type CleanFieldType = 'ADDRESS' | 'PHONE' | 'PASSPORT' | 'NAME' | 'EMAIL' | 'VEHICLE';

/**
 * Составная запись с контактными данными
 * @see https://dadata.ru/api/clean/record/
 */
export interface CleanCombinedResponse {
  /**
   * Порядок и тип данных в поле `data`.
   *
   * Например, если в поле `data` три объекта - имя, адрес и телефон,
   * то в поле `structure` будет `[ "NAME", "ADDRESS", "PHONE" ]`, соответственно.
   */
  structure: CleanFieldType[];

  /**
   * Массив из одного элемента – тоже массива, внутри которого каждый элемент -
   * это одна из стандартизированных частей записи.
   * Какая именно - определяется структурой в поле `structure`.
   */
  data: [(AddressClean | PhoneClean | PassportClean | FioClean | EmailClean | VehicleClean)[]];
}

export type CleanResponse<T> = [T];
