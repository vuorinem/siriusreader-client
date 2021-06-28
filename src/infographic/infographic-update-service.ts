import { ApplicationState } from './../state/application-state';
import { EventLogin } from '../auth/auth-service';
import { SiriusConfig } from '../config/sirius-config';
import { autoinject } from "aurelia-dependency-injection";
import { HttpClient } from "aurelia-fetch-client";
import { AuthService } from "auth/auth-service";
import { EventAggregator } from 'aurelia-event-aggregator';
import { IUserData } from './i-user-data';

@autoinject
export class InfographicUpdateService {
  public isInfographicReady: boolean = false;
  public totalEngagedReadingMinutes: number = 0;

  constructor(
    private http: HttpClient,
    private eventAggregator: EventAggregator,
    private authService: AuthService,
    private applicationState: ApplicationState) {

    this.tryRefresh();

    window.setInterval(() => this.tryRefresh(), SiriusConfig.infographicRefreshIntervalInSeconds * 1000);
    this.eventAggregator.subscribe(EventLogin, () => this.tryRefresh());
  }

  private async tryRefresh() {
    if (this.authService.isAuthenticated && this.applicationState.isReading) {
      this.updateInfographic();
    } else {
      this.isInfographicReady = false;
    }
  }

  private async updateInfographic() {
    const response = await this.http.fetch(`/infographic/update`, {
      method: 'post',
    });

    if (!response.ok) {
      throw new Error("Unable to update infographic");
    } else if (response.status == 204) { // No content
      this.isInfographicReady = false;
      this.totalEngagedReadingMinutes = 0;
    } else {
      const userData: IUserData = await response.json();
      this.isInfographicReady = userData.isInfographicReady;
      this.totalEngagedReadingMinutes = userData.totalEngagedReadingMinutes;
    }
  }
}
