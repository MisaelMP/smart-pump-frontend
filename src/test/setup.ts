/* eslint-disable @typescript-eslint/no-empty-function */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock window.history for tests
Object.defineProperty(window, 'history', {
  value: {
    back: () => {},

    forward: () => {},

    go: () => {},
    length: 1,

    pushState: () => {},

    replaceState: () => {},
    state: null,
  },
  writable: true,
});
