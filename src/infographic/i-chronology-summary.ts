import { IReadingPosition } from './i-reading-position';

export interface IChronologySummary {
  readingPositions: IReadingPosition[],
  baselineLocationsPerMinute: number,
  charactersInBook: number,
}
