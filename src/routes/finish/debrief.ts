import { HttpClient } from 'aurelia-fetch-client';
import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';
import { UserService } from './../../user/user-service';

@autoinject
export class Debrief {
  private name: string = "";

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService) {
  }

  private async send() {
    await this.userService.sendConfirmDebriefSheet(this.name);

    this.router.navigateToRoute("main");
  }
}
