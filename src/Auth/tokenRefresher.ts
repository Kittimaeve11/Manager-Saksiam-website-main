let refreshCallback: (() => Promise<string>) | null = null;

export const tokenRefresher = {
  setCallback(cb: () => Promise<string>) {
    refreshCallback = cb;
  },
  async refresh() {
    if (!refreshCallback) throw new Error("refresh callback not set");
    return refreshCallback();
  }
};