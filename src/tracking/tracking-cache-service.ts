import { ITrackingEvent } from './i-tracking-event';

type AnyEvent = ITrackingEvent;

export class TrackingCacheService {
  private eventCache: { [key: string]: AnyEvent[] } = {};
  private useInMemoryCache = false;

  constructor() {
  }

  public addEventToCache(key: string, event: AnyEvent) {
    const cache = this.getCache(key);

    cache.push(event);

    if (this.useInMemoryCache) {
      this.eventCache[key] = cache;
    } else {
      try {
        window.localStorage.setItem(key, JSON.stringify(cache));
      } catch (error) {
        this.useInMemoryCache = true;
        this.eventCache[key] = cache;
      }
    }
  }

  public clearCache(key: string) {
    if (this.useInMemoryCache) {
      this.eventCache[key] = [];
    } else {
      try {
        window.localStorage.setItem(key, JSON.stringify([]));
      } catch (error) {
        this.useInMemoryCache = true;
        this.eventCache[key] = [];
      }
    }
  }

  public getCache(key: string): AnyEvent[] {
    if (this.useInMemoryCache) {
      return this.eventCache[key];
    }

    try {
      const storageItem = window.localStorage.getItem(key);

      if (storageItem === null) {
        return [];
      }

      return JSON.parse(storageItem);
    } catch (error) {
      this.useInMemoryCache = true;
      return this.eventCache[key];
    }
  }

}
