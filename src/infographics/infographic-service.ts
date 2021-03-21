import { EventLogin } from './../auth/auth-service';
import { SiriusConfig } from './../config/sirius-config';
import { autoinject } from "aurelia-dependency-injection";
import { HttpClient } from "aurelia-fetch-client";
import { AuthService } from "auth/auth-service";
import { EventAggregator } from 'aurelia-event-aggregator';

const InfographicUpdateIntervalInSeconds = 60 * 5;

@autoinject
export class InfographicService {
  public isInfographicReady: boolean = false;

  constructor(
    private http: HttpClient,
    private eventAggregator: EventAggregator,
    private authService: AuthService) {
    
    this.tryRefresh();

    window.setInterval(() => this.tryRefresh(), SiriusConfig.infographicRefreshIntervalInSeconds * 1000);
    this.eventAggregator.subscribe(EventLogin, () => this.tryRefresh());
  }

  private async tryRefresh() {
    if (this.authService.isAuthenticated) {
      this.updateInfographic();
    } else {
      this.isInfographicReady = false;
    }
  }

  private async updateInfographic() {
    // TODO: Call infographic API
    this.isInfographicReady = !this.isInfographicReady;
  }
}
