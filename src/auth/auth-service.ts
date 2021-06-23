import { IAccountStatus } from './i-account-status';
import { IAuthenticationResult } from './i-authentication-result';
import { autoinject } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpClient } from "aurelia-fetch-client";
import { SiriusConfig } from "../config/sirius-config";

export const EventLogin = "login";
export const EventLogout = "logout";

@autoinject
export class AuthService {
  private isAuthenticatedInternal: boolean = false;

  public get isAuthenticated(): boolean {
    return this.isAuthenticatedInternal;
  }

  constructor(
    private http: HttpClient,
    private eventAggregator: EventAggregator) {

    const authService = this;

    this.http.baseUrl = SiriusConfig.apiUrl;
    this.http.defaults= {
      credentials: 'include',
    };

    this.http.interceptors.push({
      async response(response) {
        if (response.status === 401) {
          await authService.signOut();
        }

        return response;
      }
    });

    this.checkAuthenticationStatus();
  }

  public async signIn(email: string, password: string): Promise<IAuthenticationResult> {
    const response = await this.http
      .fetch('/account/signin', {
        method: "post",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

    const result: IAuthenticationResult = {
      isAuthenticated: response.ok,
    };

    if (!response.ok) {
      const responseContent = await response.json();
      result.error = responseContent.error;

      return result;
    }

    this.isAuthenticatedInternal = true;

    this.eventAggregator.publish(EventLogin);

    return result;
  }

  public async signOut() {
    const response = await this.http
      .fetch('/account/signout', { method: "post" });

    if (!response.ok) {
      throw new Error("Error with logout");
    }

    this.eventAggregator.publish(EventLogout);
  }

  private async checkAuthenticationStatus() {
    const response = await this.http
      .fetch('/account/status');

    if (!response.ok) {
      throw new Error("Error checking sign-in status");
    }

    const status = await response.json() as IAccountStatus;

    if (status.isSignedIn && !this.isAuthenticatedInternal) {
      this.eventAggregator.publish(EventLogin);
    } else if (!status.isSignedIn && this.isAuthenticatedInternal) {
      this.eventAggregator.publish(EventLogout);
    }
  }

}
