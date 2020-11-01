import { ISectionDetails } from './i-section-details';

export interface IBookDetails {
  bookId: number;
  title: string;
  author: string;
  description: string;
  contentStartLocation: number;
  sections: ISectionDetails[];
}
