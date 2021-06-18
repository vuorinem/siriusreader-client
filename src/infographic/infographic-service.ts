import { ILocationSummary } from './i-location-summary';
import { ITitle } from './../library/i-title';
import { HttpClient } from "aurelia-fetch-client";
import { autoinject } from 'aurelia-framework';
import { IReaderMotivation } from './i-reader-motivation';
import { IReadingSummary } from './i-reading-summary';
import { IChronologySummary } from './i-chronology-summary';

@autoinject
export class InfographicService {
  constructor(private http: HttpClient) {
  }

  public async getTitle() {
    const response = await this.http.fetch(`/infographic/title`);
    return await response.json() as ITitle;
  }

  public async getReaderMotivation() {
    const response = await this.http.fetch(`/infographic/reader-motivation`);
    return await response.json() as IReaderMotivation;
  }

  public async getReadingSummary() {
    const response = await this.http.fetch(`/infographic/reading-summary`);
    return await response.json() as IReadingSummary;
  }

  public async getChronologySummary() {
    const response = await this.http.fetch(`/infographic/chronology-summary`);
    return await response.json() as IChronologySummary;
  }

  public async getLocationSummary() {
    const response = await this.http.fetch(`/infographic/location-summary`);
    return await response.json() as ILocationSummary;
  }
}
