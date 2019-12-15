import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { IVerificationResponse } from 'user/i-verification-response';

@autoinject
export class Register {
  private emailAddress: string = "";
  private verificationToken: string = "";
  private participantCode: string = "";
  private password: string = "";
  private passwordConfirm: string = "";

  private isLoading: boolean = false;
  private error?: string;

  private isEmailSent: boolean = false;
  private isEmailVerified: boolean = false;
  private isEmailRegistered: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient) {
  }

  public activate(params: any) {
    this.emailAddress = params.email;
  }

  private reset() {
    this.emailAddress = "";

    this.clearState();
  }

  private clearState() {
    this.isEmailSent = false;
    this.isEmailVerified = false;
    this.isEmailRegistered = false;

    this.verificationToken = "";
    this.participantCode = "";
    this.password = "";
    this.passwordConfirm = "";
  }

  private async requestVerification() {
    this.error = undefined;

    try {
      this.isLoading = true;
      const response = await this.http.fetch(`/email-verification`, {
        method: "post",
        body: json({ emailAddress: this.emailAddress }),
      });

      if (!response.ok) {
        this.error = "Could not send registration email, please try again later.";
      } else {
        this.isEmailSent = true;
      }
    } catch (ex) {
      this.error = "Could not register, please try again later.";
    } finally {
      this.isLoading = false;
    }
  }

  private async verify() {
    this.error = undefined;
    this.isEmailVerified = false;

    try {
      this.isLoading = true;
      const response = await this.http.fetch(`/email-verification/verify`, {
        method: "post",
        body: json({
          emailAddress: this.emailAddress,
          emailVerificationToken: this.verificationToken,
        }),
      });

      if (!response.ok) {
        const responseMessage = await response.json();
        if (responseMessage) {
          this.error = responseMessage;
        } else {
          this.error = "Could not verify email address, please check the verification code.";
        }
      } else {
        const responseContent: IVerificationResponse = await response.json();
        this.isEmailVerified = true;
        this.isEmailRegistered = responseContent.isEmailRegistered;
      }
    } catch (ex) {
      this.error = "Could not register, please try again later.";
    } finally {
      this.isLoading = false;
    }
  }

  private async register() {
    if (this.password !== this.passwordConfirm) {
      this.error = "Please type the same password in both fields.";
      return;
    }

    this.error = undefined;

    try {
      this.isLoading = true;
      const response = await this.http.fetch(`/user`, {
        method: "post",
        body: json({
          emailAddress: this.emailAddress,
          emailVerificationToken: this.verificationToken,
          participantCode: this.participantCode,
          password: this.password,
        }),
      });

      if (!response.ok) {
        const responseMessage = await response.json();
        if (responseMessage) {
          this.error = responseMessage;
        } else {
          this.error = "Could not register, please try again later.";
        }
      } else {
        this.router.navigateToRoute("login");
      }
    } catch (ex) {
      this.error = "Could not register, please try again later.";
    } finally {
      this.isLoading = false;
    }
  }
}
