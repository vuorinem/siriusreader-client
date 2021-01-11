import { autoinject } from 'aurelia-framework';
import { ITitle } from './i-title';
import { ITitleDetails } from './i-title-details';
import { HttpClient, json } from 'aurelia-fetch-client';

@autoinject
export class LibraryService {

  constructor(private http: HttpClient) {
  }

  public async getTitles(): Promise<ITitle[]> {
    const response = await this.http.fetch(`/library/titles`);

    return await response.json();
  }

  public async getTitle(bookId: number): Promise<ITitleDetails> {
    const response = await this.http.fetch(`/library/titles/${bookId}`);

    return await response.json();
  }

  public async getCoverImage(bookId: number): Promise<Blob> {
    const response = await this.http.fetch(`/library/titles/${bookId}/cover`);

    return response.blob();
  }
}
