import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-dialog',
  template: `
    <h2 mat-dialog-title>Authentication Required</h2>
    <mat-dialog-content>
      <p class="intro-text">The server requires authentication. Please enter your credentials.</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Login</mat-label>
          <input matInput formControlName="login" required autofocus>
          <mat-error *ngIf="loginForm.get('login')?.hasError('required')">
            Login is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <div *ngIf="authError$ | async as error" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error }}</span>
        </div>

        <mat-dialog-actions align="end">
          <button mat-raised-button color="primary" [disabled]="!loginForm.valid || isSubmitting">
            <span *ngIf="!isSubmitting">Login</span>
            <span *ngIf="isSubmitting">
              Authenticating...
            </span>
          </button>
        </mat-dialog-actions>
      </form>
    </mat-dialog-content>
  `,
  styles: [`
    h2[mat-dialog-title] {
      margin: 0;
      padding: 20px 20px 10px 20px;
      background-color: var(--table-header-bg, #f5f5f5);
      color: var(--table-header-text, #333);
    }

    mat-dialog-content {
      padding: 24px;
      min-width: 400px;
      background-color: var(--content-bg, #f5f5f5);
      color: var(--primary-text, #333);
    }

    .intro-text {
      margin-bottom: 24px;
      color: var(--secondary-text, #666);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: var(--error-bg, #ffebee);
      border-left: 4px solid var(--error-color, #f44336);
      border-radius: 4px;
      color: var(--error-text, #c62828);
      font-size: 14px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-dialog-actions {
      padding: 12px 0 0 0;
      margin-top: 12px;
    }

    button {
      min-width: 100px;
    }
  `]
})
export class LoginDialogComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isSubmitting = false;
  authError$: any;
  private subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.authError$ = this.authService.authError$;
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Only listen for auth error after initial setup
    this.subscription.add(
      this.authService.authError$.subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      const username = this.loginForm.get('login')?.value;
      const password = this.loginForm.get('password')?.value;
      this.authService.submitLogin(username, password);

      // Wait a bit for response, then close dialog on success
      setTimeout(() => {
        if (this.authService.isAuthenticated()) {
          this.dialogRef.close(true);
        } else {
          this.isSubmitting = false;
        }
      }, 1000);
    }
  }
}
