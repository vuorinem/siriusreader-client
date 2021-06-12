import { IReadingEngagement } from './i-reading-engagement';

export interface IReadingSummary {
  averageReadingSpeedWordsPerMinute: number,
  baselineReadingSpeedWordsPerMinute: number,
  maximumReadingSpeedWordsPerMinute: number,
  readingSessionCount: number,
  averageReadingSessionInMinutes: number,
  longestReadingSessionInMinutes: number,
  longestReadingSessionEngagements: IReadingEngagement[],
}
