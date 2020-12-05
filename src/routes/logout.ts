import { TrackingService } from 'tracking/tracking-service';
import { AuthService } from '../auth/auth-service';
import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';

@autoinject
export class Logout {
  constructor(
    private router: Router,
    private trackingService: TrackingService,
    private authService: AuthService) {
  }

  public async activate() {
    await this.trackingService.event('logout');
    await this.trackingService.stop();
    this.authService.logout();
    this.router.navigateToRoute('login');
  }
}
