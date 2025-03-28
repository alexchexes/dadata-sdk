import type { BankStatus, BankType, KladrIdFilter } from './api';
import type { OneOrMany } from './helpers.types';
import type { BaseSuggestOptions } from './suggest-options.types';

export interface SuggestBankOptions extends BaseSuggestOptions {
  suggestType: 'bank';

  /**
   * Ограничение по типу банка.
   * - `BANK` - Банк
   * - `BANK_BRANCH` - Филиал банка
   * - `NKO` - Небанковская кредитная организация
   * - `NKO_BRANCH` - Филиал небанковской кредитной организации
   * - `OTHER` - Другое
   *
   * Пример: Искать только банки и их филиалы: `["BANK", "BANK_BRANCH"]`
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122}
   */
  bankType?: OneOrMany<BankType>;

  /**
   * Ограничение по статусу банка. Например:
   * - `ACTIVE` - только актуальные банки
   * - `LIQUIDATING` - только ликвидируемые
   * - `LIQUIDATED` - в реальных данных не встречается, потому что Банк России
   * не возвращает информацию о ликвидированных финансовых организациях
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996120}
   */
  entityStatus?: OneOrMany<BankStatus>;

  /**
   * Ограничение по региону или городу банка (один или несколько КЛАДР-кодов). Например:
   * - `50` - Московская область
   * - `[54000001, 61000001]` - Ростов и Новосибирск
   *  {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106238}
   */
  locationsFilter?: OneOrMany<KladrIdFilter | string | number>;

  /**
   * Приоритет региона или города при ранжировании (один или несколько КЛАДР-кодов). Например:
   * - `50` - Московская область
   * - `[54000001, 61000001]` - Ростов и Новосибирск
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=527106242}
   */
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
}
