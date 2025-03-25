import type { DEFAULT_CLASSES, SHOW_ON_FOCUS_OPTIONS } from '@/const';

export type ShowOnFocusOption = (typeof SHOW_ON_FOCUS_OPTIONS)[number];

/** @see DEFAULT_CLASSES */
export type VueDadataClasses = Partial<{ -readonly [K in keyof typeof DEFAULT_CLASSES]: string }>;
