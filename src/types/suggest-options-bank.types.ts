import type { BankStatus, BankType, KladrIdFilter } from './api';
import type { OneOrMany } from './helpers.types';
import type { BaseSuggestOptions } from './suggest-options.types';

export interface SuggestBankOptions extends BaseSuggestOptions {
  suggestType: 'bank';

  /**
   * Фильтр по типу банка.
   * - `CBR` — главное управление Банка России (21.2+)
   * - `BANK` — банк
   * - `BANK_BRANCH` — филиал банка
   * - `NKO` — небанковская кредитная организация (НКО)
   * - `NKO_BRANCH` — филиал НКО
   * - `RKC` — расчетно-кассовый центр
   * - `TREASURY` — территориальный орган Федерального казначейства (21.2+)
   * - `OTHER` — другой
   *
   * Пример: Искать только банки и их филиалы: `["BANK", "BANK_BRANCH"]`
   *
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=262996122}
   */
  entityType?: OneOrMany<BankType>;

  /**
   * Фильтр по статусу банка. Например:
   * - `ACTIVE` - только актуальные банки
   * - `LIQUIDATING` - только ликвидируемые
   * - `LIQUIDATED` - только ликвидированные
   *
   * Статус LIQUIDATED в реальных данных не встречается, потому что Банк России
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
