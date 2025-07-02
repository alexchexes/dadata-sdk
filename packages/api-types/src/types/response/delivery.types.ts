import type { SuggestionsResponse } from '../common.types';

/**
 * @see https://dadata.ru/api/delivery/
 */
export interface DeliverySuggestion {
  /** КЛАДР-код запрошенного города */
  value: string;
  /** ФИАС-код запрошенного города */
  unrestricted_value: string;
  /** Подробные идентификаторы города в службах доставки */
  data: DeliverySuggestion;
}

export interface DeliverySuggestionData {
  /**
   * КЛАДР-код города
   */
  kladr_id: string;
  /**
   * ФИАС-код города
   */
  fias_id: string;
  /**
   * Идентификатор города по справочнику Boxberry
   * @see https://help.boxberry.ru/pages/viewpage.action?pageId=1703974
   */
  boxberry_id: string | null;
  /**
   * Идентификатор города по справочнику СДЭК
   * @see https://passport.cdek.ru/clients/integrator.html
   */
  cdek_id: string | null;
  /**
   * Идентификатор города по справочнику DPD
   * @see https://www.dpd.ru/dpd/integration/integration.do2
   */
  dpd_id: string | null;
}

export type FindDeliveryResponse = SuggestionsResponse<DeliverySuggestion>;
