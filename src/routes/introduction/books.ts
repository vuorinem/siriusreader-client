import { BookService } from './../../book/book-service';
import { IBookDetails } from './../../book/i-book-details';
import { IBookRating } from './i-book-rating';
import { Router } from 'aurelia-router';
import { HttpClient } from 'aurelia-fetch-client';
import { UserService } from './../../user/user-service';
import { autoinject, computedFrom } from 'aurelia-framework';

type BookRatingRow = { details: IBookDetails, rating?: number };

@autoinject
export class Books {

  private books: BookRatingRow[] = [];
  private ratingOptions = [
    { rating: 1, label: "1 - Not at all interested" },
    { rating: 2, label: "2" },
    { rating: 3, label: "3" },
    { rating: 4, label: "4" },
    { rating: 5, label: "5 - Very interested" },
  ];

  private get canConfirm(): boolean {
    return this.books.length > 0 &&
      !this.books.some(book => !book.rating) &&
      !this.http.isRequesting;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private bookService: BookService) {
  }

  public async activate() {
    if (this.userService.user.isBookSelected) {
      this.router.navigateToRoute("main");
    }

    const books = await this.bookService.getAllBooks();

    this.books = books.map(book => <BookRatingRow>{
      details: book,
    });
  }

  private async confirm() {
    const ratings = this.books.map(book => <IBookRating>{
      bookId: book.details.bookId,
      rating: book.rating,
    });

    await this.bookService.selectBook(ratings);

    await this.userService.load();

    this.router.navigateToRoute("main");
  }

}
