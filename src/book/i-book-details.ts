import { ISectionDetails } from './i-section-details';

export interface IBookDetails {
  bookId: number;
  title: string;
  author: string;
  contentStartLocation: number;
  sections: ISectionDetails[];
}
