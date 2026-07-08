import "@testing-library/jest-dom";

// jsdom does not implement IntersectionObserver, which framer-motion's
// `whileInView` viewport animations rely on (introduced in SIR-2239). Without
// this mock, rendering any component that uses viewport animations throws
// "ReferenceError: IntersectionObserver is not defined". See SIR-2342.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    if (options?.root instanceof Element || options?.root instanceof Document) {
      this.root = options.root;
    }
    if (options?.rootMargin) {
      this.rootMargin = options.rootMargin;
    }
    if (options?.threshold != null) {
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold];
    }
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
