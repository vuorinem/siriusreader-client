import { AuthService } from '../auth/auth-service';
import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';

@autoinject
export class Logout {
  constructor(
    private router: Router,
    private authService: AuthService) {
  }

  public activate() {
    this.authService.logout();
    this.router.navigateToRoute("main");
  }
}
