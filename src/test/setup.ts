import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    constructor(_callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock';
  URL.revokeObjectURL = () => {};
}
