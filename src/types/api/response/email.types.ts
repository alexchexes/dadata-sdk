/** @see https://dadata.ru/api/clean/email/ */
export interface EmailClean {
  /** Исходный email */
  source: string;
  /** Стандартизованный email */
  email: string | null;
  /** Локальная часть адреса (то, что до «собачки») */
  local: string | null;
  /** Домен (то, что после «собачки») */
  domain: string | null;
  /**
   * Тип адреса
   * - PERSONAL — личный (`@mail.ru`, `@yandex.ru`)
   * - CORPORATE — корпоративный (`@myshop.ru`)
   * - ROLE — «ролевой» (`info@`, `support@`)
   * - DISPOSABLE — одноразовый (`@temp-mail.ru`)
   */
  type: null | 'PERSONAL' | 'CORPORATE' | 'ROLE' | 'DISPOSABLE';
  /**
   * Код проверки. Подходит ли email для маркетинговой рассылки:
   * | Код | Нужно проверить вручную? | Описание |
   * |-|-|-|
   * | `0` | Нет | Корректный адрес (по общим правилам; существование не проверяется) |
   * | `1` | ДА | Некорректное значение (синтаксически) |
   * | `2` | Нет | Пустой или заведомо «мусорный» |
   * | `3` | Нет | «Одноразовый» адрес (по списку известных доменов) |
   * | `4` | ДА | Исправлены опечатки |
   */
  qc: 0 | 1 | 2 | 3 | 4;
}

/** @see https://dadata.ru/api/suggest/email/ */
export interface EmailSuggestion {
  /** Email одной строкой */
  value: string;
  /** = value */
  unrestricted_value: string;
  /** Подробности об email */
  data: {
    /**
     * Локальная часть адреса (то, что до «собачки»)
     */
    local: string | null;
    /**
     * Домен (то, что после «собачки»)
     */
    domain: string | null;

    /** Тип адреса. Корпоративный/личный/etc (только для Стандартизации) */
    type: null;
    /** Код проверки. Подходит ли email для маркетинговой рассылки (только для Стандартизации) */
    qc: null;
    /** Исходный email (только для Стандартизации) */
    source: null;
  };
}
