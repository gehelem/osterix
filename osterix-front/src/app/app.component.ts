import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { LoginDialogComponent } from './dialogs/login-dialog.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'osterix-front';
  connected = false;
  moduleCount = 0;
  isDarkMode = false;
  warningCount = 0;
  errorCount = 0;
  currentRoute = '';

  private subscription = new Subscription();

  constructor(
    public wsService: WebsocketService,
    public themeService: ThemeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Connect to WebSocket on app startup
    this.wsService.connect();

    // Track current route
    this.subscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.currentRoute = event.url.split('/')[1] || 'home';
        })
    );

    // Subscribe to connection status
    this.subscription.add(
      this.wsService.connected$.subscribe(connected => {
        this.connected = connected;
        console.log('Connection status:', connected ? 'Connected' : 'Disconnected');
      })
    );

    // Subscribe to state updates to track loaded modules
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        this.moduleCount = Object.keys(state.modules).length;
        if (this.moduleCount > 0) {
          console.log(`Loaded ${this.moduleCount} modules:`, Object.keys(state.modules));
        }
      })
    );

    // Subscribe to theme changes
    this.subscription.add(
      this.themeService.darkMode$.subscribe(isDark => {
        this.isDarkMode = isDark;
      })
    );

    // Subscribe to message history to count warnings and errors
    this.subscription.add(
      this.wsService.messageHistory$.subscribe(messages => {
        this.warningCount = messages.filter(msg => msg.type === 'warning').length;
        this.errorCount = messages.filter(msg => msg.type === 'error').length;
      })
    );

    // Subscribe to authentication status and show login dialog if needed
    this.subscription.add(
      this.authService.loginRequired$.subscribe(required => {
        if (required) {
          this.showLoginDialog();
        }
      })
    );
  }

  /**
   * Show login dialog
   */
  private showLoginDialog(): void {
    this.dialog.open(LoginDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    });
  }

  /**
   * Toggle dark mode
   */
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  /**
   * Open parameters dialog for current module
   */
  openModuleSettings(): void {
    // Routes that don't have parameters dialogs
    const noSettingsRoutes = ['home', 'messages'];

    if (noSettingsRoutes.includes(this.currentRoute)) {
      return;
    }

    // Get the component reference for the current route and call its openParametersDialog method
    // This is a bit tricky since we're in the root component
    // We'll use a service-based approach instead
    const event = new CustomEvent('openModuleSettings', {
      detail: { route: this.currentRoute }
    });
    window.dispatchEvent(event);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();

    // Disconnect from WebSocket
    this.wsService.disconnect();
  }
}
