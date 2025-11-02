import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Authentication state
  private authenticatedSubject = new BehaviorSubject<boolean>(false);
  public authenticated$: Observable<boolean> = this.authenticatedSubject.asObservable();

  // Login required state
  private loginRequiredSubject = new BehaviorSubject<boolean>(false);
  public loginRequired$: Observable<boolean> = this.loginRequiredSubject.asObservable();

  // Error message
  private authErrorSubject = new BehaviorSubject<string>('');
  public authError$: Observable<string> = this.authErrorSubject.asObservable();

  private loginDialogShown = false;
  private loginPropertyExists = false;

  constructor(private websocketService: WebsocketService) {
    // Subscribe to state changes to detect when login is required
    this.websocketService.state$.subscribe(state => {
      const mainctlModule = state.modules['mainctl'];
      const hasLoginProperty = mainctlModule && mainctlModule.properties['login'];

      // Show login dialog if login property appears
      if (!this.loginDialogShown && hasLoginProperty) {
        this.loginDialogShown = true;
        this.loginPropertyExists = true;
        this.loginRequiredSubject.next(true);
        this.authenticatedSubject.next(false);
      }

      // Authentication successful: login property has disappeared
      if (this.loginPropertyExists && !hasLoginProperty) {
        this.loginPropertyExists = false;
        this.authenticatedSubject.next(true);
        this.loginRequiredSubject.next(false);
        console.log('✅ Authentication successful!');

        // Request full state update to get all modules
        this.websocketService.requestFullState();
      }
    });
  }

  /**
   * Submit login credentials
   */
  submitLogin(username: string, password: string): void {
    // Send login credentials to mainctl module
    // Format: {"evt":"Fsetproperty","mod":"mainctl","dta":{"login":{"elements":{"pw":"guest","user":"GUEST"}}}}
    this.websocketService.setProperty('mainctl', 'login', {
      'user': username,
      'pw': password
    });

    // Clear any previous error
    this.authErrorSubject.next('');
  }

  /**
   * Mark user as authenticated
   */
  setAuthenticated(authenticated: boolean): void {
    this.authenticatedSubject.next(authenticated);
    this.loginRequiredSubject.next(!authenticated);
  }

  /**
   * Set authentication error message
   */
  setAuthError(error: string): void {
    this.authErrorSubject.next(error);
  }

  /**
   * Check if login is required
   */
  isLoginRequired(): boolean {
    return this.loginRequiredSubject.value;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }
}
