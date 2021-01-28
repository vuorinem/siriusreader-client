import { ITrackingEvent } from './i-tracking-event';
import { ILibraryEvent } from './i-library-event';

type AnyEvent = ITrackingEvent | ILibraryEvent;

export type EventCacheKey = 'event-cache' | 'library-event-cache';

export class TrackingCacheService {
  private eventCache: { [key in EventCacheKey]: AnyEvent[] } = {
    "event-cache": [],
    "library-event-cache": [],
  };

  private useInMemoryCache = false;

  constructor() {
  }

  public addEventToCache(key: EventCacheKey, event: AnyEvent) {
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

  public clearCache(key: EventCacheKey) {
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

  public getCache(key: EventCacheKey): AnyEvent[] {
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
