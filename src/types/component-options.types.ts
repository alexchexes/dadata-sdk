import type { DEFAULT_CLASSES, SHOW_ON_FOCUS_OPTIONS } from '@/const';
import type WordHighlighter from 'vue-word-highlighter';

export type ShowOnFocusOption = (typeof SHOW_ON_FOCUS_OPTIONS)[number];

/** @see DEFAULT_CLASSES */
export type VueDadataClasses = Partial<{ -readonly [K in keyof typeof DEFAULT_CLASSES]: string }>;

/**
 * @typedef {import('@/const').DEFAULT_HIGHLIGHT_OPTIONS} ← just IDE quick jump to the constant (Alt+Click)
 */
export type HighlightOptions = Pick<
  InstanceType<typeof WordHighlighter>['$props'],
  | 'caseSensitive'
  | 'splitBySpace'
  | 'highlightTag'
  | 'highlightClass'
  | 'highlightStyle'
  | 'wrapperTag'
  | 'wrapperClass'
>;
