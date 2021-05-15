import { EventLogin } from './../auth/auth-service';
import { SiriusConfig } from './../config/sirius-config';
import { autoinject } from "aurelia-dependency-injection";
import { HttpClient } from "aurelia-fetch-client";
import { AuthService } from "auth/auth-service";
import { EventAggregator } from 'aurelia-event-aggregator';
import { IUserData } from './i-user-data';

@autoinject
export class InfographicService {
  public isInfographicReady: boolean = false;
  public totalEngagedReadingMinutes: number = 0;

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
    const response = await this.http.fetch(`/infographic/update`, {
      method: 'post',
    });

    const userData: IUserData | null = await response.json();

    if (userData) {
      this.isInfographicReady = userData.isInfographicReady;
      this.totalEngagedReadingMinutes = userData.totalEngagedReadingMinutes;
    } else {
      this.isInfographicReady = false;
      this.totalEngagedReadingMinutes = 0;
    }
  }
}
