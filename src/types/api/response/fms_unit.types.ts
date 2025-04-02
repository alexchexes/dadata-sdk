import type { FmsUnitType } from '../api-common.types';

/** @see https://dadata.ru/api/suggest/fms_unit/ */
export interface FmsUnitSuggestion {
  /**
   * Название подразделения одной строкой (как показывается в списке подсказок)
   */
  value: string;
  /**
   * То же, что и value
   */
  unrestricted_value: string;
  /**
   * Подробности о подразделении
   */
  data: {
    /** Код подразделения */
    code: string;
    /** Название подразделения в творительном падеже (например, «ОВД Зюзино г. Москвы») */
    name: string;
    /** Первые 2 цифры КЛАДР-кода региона (`77` или `04`) */
    region_code: string;
    /**
     * Вид подразделения:
     * - `0` — подразделение ФМС
     * - `1` — ГУВД или МВД региона
     * - `2` — УВД или ОВД района или города
     * - `3` — отделение полиции
     */
    type: FmsUnitType;
  };
}
