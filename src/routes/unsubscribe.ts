import { autoinject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';

@autoinject
export class Unsubscribe {
  private id: string;
  private emailAddress?: string;
  private isConfirmed: boolean = false;

  constructor(
    private http: HttpClient) {
  }

  public async activate(params: { id: string }) {
    this.id = params.id;

    const response = await this.http
      .fetch(`/notification/unsubscribe/${this.id}`);

    if (response.status == 200) {
      this.emailAddress = await response.json();
    }
  }

  public async confirm(): Promise<void> {
    const response = await this.http
      .fetch(`/notification/unsubscribe/${this.id}`, {
        method: 'post',
      });

    this.isConfirmed = response.ok;
  }
}
