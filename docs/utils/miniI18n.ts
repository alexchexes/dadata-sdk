export interface MiniI18nOptions {
  /** active locale, e.g. "en" */
  locale: string;
  /** dictionaries in the shape { en: {...}, es: {...} } */
  messages: Record<string, unknown>;
  /** secondary locale to look up if the key is missing in `locale` */
  fallbackLocale?: string;
  /** warn when falling back? */
  fallbackWarn?: boolean;
}

/**
 * Very small, runtime‑free replacement for vue‑i18n's `createI18n()` that only exposes `t()`
 */
export function createMiniI18n({
  locale,
  messages,
  fallbackLocale,
  fallbackWarn = true,
}: MiniI18nOptions) {
  const dictPrimary = messages[locale];
  const dictFallback =
    fallbackLocale && fallbackLocale !== locale ? messages[fallbackLocale] : undefined;

  function warn(msg: string) {
    console.warn(`[miniI18n] ${msg}`);
  }

  /** deep lookup with dot‑notation */
  function resolve(dict: unknown, key: string): string | undefined {
    return key.split('.').reduce<any>((acc, k) => acc?.[k], dict);
  }

  /** mini‑`t()` that supports {placeholders} interpolation + fallback */
  function t(key: string, vars: Record<string, string | number> = {}): string {
    let text = resolve(dictPrimary, key);

    if (text == null && dictFallback) {
      text = resolve(dictFallback, key);
      if (text != null && fallbackWarn) {
        warn(`fallback to "${fallbackLocale}" for key: ${key}`);
      }
    }

    if (text == null) {
      warn(`message not found: ${key} (${locale})`);
      return key;
    }

    return String(text).replace(/\{(\w+)\}/g, (_, name) => {
      if (!(name in vars)) {
        warn(`missing placeholder "${name}" for key: ${key}`);
      }
      return String(vars[name] ?? `{${name}}`);
    });
  }

  return t;
}
