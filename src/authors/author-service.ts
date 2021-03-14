import { UserService } from './../user/user-service';
import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from "aurelia-framework";

@autoinject
export class AuthorService {

  constructor(
    private http: HttpClient,
    private userService: UserService) {
  }

  public async getAuthors(): Promise<string[]> {
    const response = await this.http.fetch(`/author`);

    if (!response.ok) {
      throw new Error('Error retrieving authors');
    }

    return await response.json();
  }

  public async saveAnswers(authors: string[]): Promise<void> {
    const response = await this.http
      .fetch(`/author/answers`, {
        method: 'post',
        body: json(authors),
      });

    if (!response.ok) {
      throw new Error('Error sending author answers');
    }

    await this.userService.load();
  }
}
