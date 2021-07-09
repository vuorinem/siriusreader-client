import { SiriusConfig } from 'config/sirius-config';
import { HttpClient } from 'aurelia-fetch-client';
import { IBookDetails } from './i-book-details';
import { autoinject, computedFrom } from "aurelia-framework";

@autoinject
export class BookService {
  @computedFrom('bookDetails')
  public get isBookSelected(): boolean {
    return !!this.bookDetails;
  }

  @computedFrom('bookDetails')
  public get book(): IBookDetails | undefined {
    return this.bookDetails;
  }

  private bookDetails?: IBookDetails;
  private domParser: DOMParser = new DOMParser();

  constructor(private http: HttpClient) {
  }

  public async loadSelectedBook() {
    const response = await this.http
      .fetch(`/book/selected`);

    if (response.status === 204) {
      // Selected book returned no content
      this.bookDetails = undefined;

      return;
    }

    this.bookDetails = await response.json();
  }

  public async getSection(sectionNumber: number): Promise<NodeList> {
    if (!this.book) {
      throw new Error("Book has not been selected");
    }

    const response = await this.http
      .fetch(`/book/selected/section/${sectionNumber}`);

    if (response.body === null) {
      throw new Error('No book content returned');
    }

    const bodyLength = response.headers.get('content-length');

    if (bodyLength === null) {
      throw new Error('No book content returned');
    }

    const htmlArray = new Uint8Array(parseInt(bodyLength));
    let totalIndex = 0;
    let chunk: ReadableStreamDefaultReadResult<Uint8Array>;
    const reader = response.body.getReader();

    do {
      chunk = await reader.read();

      if (chunk.value === undefined) {
        break;
      }

      for (let chunkIndex = 0; chunkIndex < chunk.value.length; chunkIndex++, totalIndex++) {
        htmlArray[totalIndex] = chunk.value[chunkIndex] ^ SiriusConfig.bdk[totalIndex % SiriusConfig.bdk.length];
      }
    } while (!chunk.done);

    const blob = new Blob([htmlArray]);

    const responseHtml = await blob.text();
    const document = this.domParser.parseFromString(responseHtml, "text/html");
    const bodyElements = document.getElementsByTagName("body");

    if (bodyElements.length !== 1) {
      throw new Error('Invalid HTML returned by API');
    }

    return bodyElements[0].childNodes;
  }

  public async getImage(imageUrl: string): Promise<Blob> {
    if (!this.book) {
      throw new Error("Book has not been selected");
    }

    const response = await this.http
      .fetch(`/book/selected/image/${imageUrl}`);

    return response.blob();
  }
}
