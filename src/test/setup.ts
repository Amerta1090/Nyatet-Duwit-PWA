import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as ResizeObserver;
}
