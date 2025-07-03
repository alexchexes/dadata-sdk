export type ErrorResponse = {
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
   * @example "Feature 'SUGGESTIONS' disabled for token 'XXX'. See https://dadata.userecho.com/topics/1834 for help.""
   */
  message: string;
};
