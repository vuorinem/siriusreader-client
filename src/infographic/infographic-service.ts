import { ITitle } from './../library/i-title';
import { HttpClient } from "aurelia-fetch-client";
import { autoinject } from 'aurelia-framework';
import { IReaderMotivation } from './i-reader-motivation';

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

}
