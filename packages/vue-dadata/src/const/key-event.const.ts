export const HandledKeys = {
  Enter: 'Enter',
  Esc: 'Escape',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
} as const;

export type HandledKeys = (typeof HandledKeys)[keyof typeof HandledKeys];
