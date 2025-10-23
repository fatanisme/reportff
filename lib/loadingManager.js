class LoadingManager {
  constructor() {
    this.pendingRequests = 0;
    this.listeners = new Set();
  }

  subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    this.listeners.add(listener);
    listener(this.isLoading());
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    const state = this.isLoading();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("Global loading listener error", error);
      }
    });
  }

  increment() {
    this.pendingRequests += 1;
    this.notify();
  }

  decrement() {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    this.notify();
  }

  isLoading() {
    return this.pendingRequests > 0;
  }
}

export const loadingManager = new LoadingManager();
