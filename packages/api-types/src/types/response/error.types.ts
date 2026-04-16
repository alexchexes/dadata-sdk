/**
 * Объект ошибки, возвращаемой эндпоинтами API `suggest`, `findById`, `findByEmail`
 */
export type SuggestErrorResponse = {
  /**
   * @example 'CLIENT_ERROR'
   */
  family: string;
  /**
   * @example 'Unauthorized'
   * @example 'Forbidden'
   */
  reason: string;
  /**
   * @example 'You should provide Authorization header with your api token'
   * @example "Feature 'SUGGESTIONS' disabled for token 'XXX'. See https://dadata.userecho.com/topics/1834 for help."
   * @example "Feature 'COMPANY' disabled for token 'XXX'."
   */
  message: string;
};

/**
 * Один из двух видов объекта ошибки, возвращаемых API Стандартизации.
 */
export type CleanErrorResponseAlt1 = {
  /**
   * @example: '2026-01-01T11:22:33.666+00:00'
   */
  timestamp: string;
  /**
   * @example 401
   * @example 403
   * @example 404
   */
  status: number;
  /**
   * @example 'Unauthorized'
   * @example 'Forbidden'
   * @example 'Not Found'
   */
  error: string;
  /**
   * @example "You should provide Authorization header with your api token"
   * @example "You should provide X-Secret header with your secret key"
   * @example "Feature 'CLEAN' disabled for token 'XXX'. See https://dadata.userecho.com/topics/7784 for help."
   * @example "Service not found: foo"
   */
  message: string;
  /**
   * @example '/api/v1/clean/address'
   * @example '/api/v1/clean'
   * @example '/api/v1/clean/foo'
   */
  path: string;
};

/**
 * Один из двух видов объекта ошибки, возвращаемых API Стандартизации.
 *
 * Отдаётся в некоторых случаях при некорректно сформированном запросе, например:
 * - Запрос к https://cleaner.dadata.ru/api/v1/clean/address c неверным `Content-Type`
 * - Запрос к https://cleaner.dadata.ru/api/v1/clean/address с некорректным POST body
 * - Запрос к https://cleaner.dadata.ru/api/v1/clean/address методом, отличным от POST
 * - Запрос к некорректному URL вида https://cleaner.dadata.ru/api/v1/clean/foo/bar
 * - Запрос к некорректному URL вида https://cleaner.dadata.ru/api/v1/clean/foo/bar/baz
 *
 * Заголовки ответа с таким форматом объекта содержат `Content-Type: application/problem+json`
 */
export type CleanErrorResponseAlt2 = {
  /**
   * @example "about:blank"
   */
  type: string;
  /**
   * @example "Bad Request"
   * @example "Not Found"
   * @example "Method Not Allowed"
   * @example "Unsupported Media Type"
   */
  title: string;
  /**
   * @example 400
   * @example 404
   * @example 405
   * @example 415
   */
  status: number;
  /**
   * @example "Failed to read request"
   * @example "No static resource api/v1/clean/address/foo."
   * @example "Method 'GET' is not supported."
   * @example "Content-Type 'application/x-www-form-urlencoded;charset=UTF-8' is not supported."
   */
  detail: string;
  /**
   * @example "/api/v1/clean/address"
   * @example "/api/v1/clean/address/foo"
   */
  instance: string;
};

export type CleanErrorResponse = CleanErrorResponseAlt1 | CleanErrorResponseAlt2;

/**
 * Объект ошибки, возвращаемой эндпоинт API `stat/daily` и `profile/balance`
 */
export type ApiV2ErrorResponse = {
  /** @example 'unauthorized' */
  code: string;

  message: string;

  // Мы не знаем, что тут должно быть; в ответе - `fields: {}`, но наш генератор схем сейчас намеренно
  // ругается на `Record<string, unknown>`. И т.к. данный формат ошибки не задокументирован официально,
  // то чтобы не вводить исключения в генераторе, для простоты оставляем `unknown` ("любая схема").
  fields: unknown;

  errors: unknown[];
};

/**
 * Объект ошибки, возвращаемый при запросах к несуществующим или непубличным API, например:
 * POST https://dadata.ru/api/foo
 */
export type NonPublicApiErrorResponse = {
  error: boolean;
  /**
   * @example "https://dadata.ru/api/profile/balance"
   */
  url: string;
  /**
   * @example 404
   */
  statusCode: number;
  /**
   * @example "Page Not Found"
   */
  statusMessage: string;
  /**
   * @example "Page Not Found"
   */
  message: string;
};
