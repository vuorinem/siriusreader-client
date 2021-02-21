import { IAuthenticationResult } from './i-authentication-result';
import { ITokenResponse } from './i-token-response';
import { autoinject, computedFrom } from "aurelia-framework";
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpClient } from "aurelia-fetch-client";
import { SiriusConfig } from "../config/sirius-config";
import 'url-search-params-polyfill';

const TokenStorageKey = "nr-token";
const RefreshTimeoutKey = "nr-token-refresh";

export const EventLogin = "login";
export const EventLogout = "logout";

@autoinject
export class AuthService {
  private tokenDetails: ITokenResponse | null = null;
  private expiresAt?: Date;
  private storage: Storage;

  private refreshTimerHandler?: number;
  private refreshAction?: Promise<boolean>;

  @computedFrom("tokenDetails")
  public get isAuthenticated(): boolean {
    return !!this.tokenDetails;
  }

  constructor(
    private http: HttpClient,
    private eventAggregator: EventAggregator) {

    this.storage = sessionStorage;

    this.load();

    const authService = this;

    this.http.baseUrl = SiriusConfig.apiUrl;

    this.http.interceptors.push({
      async request(request: Request) {
        const token = await authService.getToken();
        if (token) {
          request.headers.append('Authorization', 'Bearer ' + token);
        }

        return request;
      },
      async response(response) {
        if (response.status === 401) {
          const refreshSuccessful = await authService.refresh();

          if (!refreshSuccessful && authService.isAuthenticated) {
            authService.logout();
          }
        }

        return response;
      }
    });
  }

  public async getToken(): Promise<string | undefined> {
    if (!this.tokenDetails) {
      return;
    }

    if (this.expiresAt && this.expiresAt < new Date()) {
      if (!(await this.refresh())) {
        return;
      }
    }

    return this.tokenDetails.access_token;
  }

  public async authenticate(email: string, password: string): Promise<IAuthenticationResult> {
    const request = new URLSearchParams();
    request.append("grant_type", "password");
    request.append("username", email);
    request.append("password", password);

    const response = await this.http
      .fetch(SiriusConfig.tokenEndpoint, {
        method: "post",
        body: request.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
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

    this.setToken(await response.json());

    this.eventAggregator.publish(EventLogin);

    return result;
  }

  public logout() {
    this.setToken(null);

    this.eventAggregator.publish(EventLogout);
  }

  public async refresh(): Promise<boolean> {
    if (!this.refreshAction) {
      this.refreshAction = new Promise(async resolve => {
        const result = await this.forceRefresh();
        this.refreshAction = undefined;
        resolve(result);
      });
    }

    return this.refreshAction;
  }

  private setToken(tokenResponse: ITokenResponse | null) {
    this.tokenDetails = tokenResponse;
    this.expiresAt = this.calculateExpiresAt(tokenResponse);

    this.save();
  }

  private calculateExpiresAt(tokenResponse: ITokenResponse | null): Date | undefined {
    if (tokenResponse) {
      return new Date((new Date()).getTime() + tokenResponse.expires_in * 1000);
    } else {
      return undefined;
    }
  }

  private load() {
    const savedToken = this.storage.getItem(TokenStorageKey);

    if (savedToken) {
      this.tokenDetails = JSON.parse(savedToken);

      const savedExpiresAt = this.storage.getItem(RefreshTimeoutKey);

      if (savedExpiresAt) {
        this.expiresAt = new Date(savedExpiresAt);
      } else {
        // Token is stored but expiresAt is not, re-calculate from token
        this.expiresAt = this.calculateExpiresAt(this.tokenDetails);
      }
    } else {
      // No token stored, ensure that expiresAt is also clear
      this.expiresAt = undefined;
      this.storage.removeItem(RefreshTimeoutKey);
    }

    this.setRefreshTimer();
  }

  private save() {
    if (this.tokenDetails) {
      this.storage.setItem(TokenStorageKey, JSON.stringify(this.tokenDetails));
    } else {
      this.storage.removeItem(TokenStorageKey);
    }

    if (this.expiresAt) {
      this.storage.setItem(RefreshTimeoutKey, JSON.stringify(this.expiresAt.getTime()));
    } else {
      this.storage.removeItem(RefreshTimeoutKey);
    }

    this.setRefreshTimer();
  }

  private async forceRefresh(): Promise<boolean> {
    this.clearRefreshTimer();

    if (!this.tokenDetails) {
      return false;
    }

    const request = new URLSearchParams();
    request.append("grant_type", "refresh_token");
    request.append("refresh_token", this.tokenDetails.refresh_token);

    const response = await this.http
      .fetch(SiriusConfig.tokenEndpoint, {
        method: "post",
        body: request.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

    if (!response.ok) {
      this.setToken(null);
    } else {
      this.setToken(await response.json());
    }

    return this.isAuthenticated;
  }

  private setRefreshTimer() {
    this.clearRefreshTimer();

    if (this.tokenDetails && this.expiresAt) {
      const expiresInMilliseconds = this.expiresAt.getTime() - (new Date().getTime());
      this.refreshTimerHandler = window.setTimeout(
        () => this.refresh(),
        expiresInMilliseconds / 2);
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimerHandler) {
      clearTimeout(this.refreshTimerHandler);
      this.refreshTimerHandler = undefined;
    }
  }

}
