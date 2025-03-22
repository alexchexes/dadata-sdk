export const KeyEvent = {
  Enter: 'enter',
  Esc: 'esc',
  Up: 'up',
  Down: 'down',
} as const;

export type KeyEvent = (typeof KeyEvent)[keyof typeof KeyEvent];
