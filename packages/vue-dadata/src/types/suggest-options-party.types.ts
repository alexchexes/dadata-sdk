import type { KladrIdFilter, PartyStatus, PartyType, OneOrMany } from '@dadata-sdk/api-types';
import type { BaseSuggestOptions } from './suggest-options.types';

/**
 *
 */
export interface SuggestPartyOptions extends BaseSuggestOptions {
  suggestType: 'party';

  /**
   * Ограничение по типу организации.
   * - `LEGAL` - юрлицо
   * - `INDIVIDUAL` - ИП
   */
  entityType?: PartyType | [PartyType];

  /**
   * Ограничение по статусу организации.
   * - `ACTIVE`        действующая
   * - `LIQUIDATING`   ликвидируется
   * - `LIQUIDATED`    ликвидирована
   * - `REORGANIZING`  в процессе присоединения к другому юрлицу, с последующей ликвидацией
   * - `BANKRUPT`      банкрот (с февраля 2021)
   *
   * Например:
   * - действующие: `ACTIVE`
   * - ликвидируемые и ликвидированные: `['LIQUIDATING', 'LIQUIDATED']`
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=206176335}
   */
  entityStatus?: OneOrMany<PartyStatus>;

  /**
   * Ограничение по коду ОКВЭД. Максимально - 10 кодов.
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=1093075333}
   */
  okved?: OneOrMany<string>;

  /**
   * Ограничение по региону (один или несколько **двузначных** КЛАДР-кодов региона). Например:
   * - `50` - Московская область
   * - `[50, 77]` - Москва и Московская область
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=204669123}
   */
  locationsFilter?: OneOrMany<KladrIdFilter | string | number>;

  /**
   * Приоритет города при ранжировании (один или несколько КЛАДР-кодов). Например:
   * - `50` - Московская область
   * - `[54000001, 61000001]` - Ростов и Новосибирск
   *
   * * Компании ранжируются по адресу, ИП - по региону ИНН
   * {@link https://confluence.hflabs.ru/pages/viewpage.action?pageId=285343852}
   */
  locationsBoost?: OneOrMany<KladrIdFilter | string | number>;
}
