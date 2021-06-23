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
    try {
      await this.trackingService.event('logout');
      await this.trackingService.stop();
    } catch {
      // Ignore errors and logout anyway
    }
    
    await this.authService.signOut();
    this.router.navigateToRoute('login');
  }
}
