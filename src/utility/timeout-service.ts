export class TimeoutService {

  private debounceTimers: Map<string, number> = new Map<string, number>();

  public debounce(key: string, timeout: number, callback: () => void | Promise<void>) {
    const timer = this.debounceTimers.get(key);

    if (timer !== undefined) {
      clearTimeout(timer);
    }

    this.debounceTimers.set(key, window.setTimeout(() => {
      this.debounceTimers.delete(key);
      callback();
    }, timeout));
  }

  public cancel(key: string) {
    const timer = this.debounceTimers.get(key);

    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }

}
