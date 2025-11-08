import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { WebsocketService } from './services/websocket.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { ServerConfigService } from './services/server-config.service';
import { LoginDialogComponent } from './dialogs/login-dialog.component';
import { ServerConfigDialogComponent } from './dialogs/server-config-dialog.component';
import { HomeParametersDialogComponent } from './pages/home/home-parameters-dialog.component';
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
    private serverConfigService: ServerConfigService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // First, show server configuration dialog to allow user to set the server URL
    // Then connect to WebSocket once configured
    this.showInitialServerConfigDialog();

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
   * Show server configuration dialog on app startup
   * This must be completed before connecting to WebSocket
   */
  private showInitialServerConfigDialog(): void {
    // Check if server config has been configured before
    const config = this.serverConfigService.getConfig();

    // If using default localhost config and on mobile, prompt user to configure
    // Otherwise, proceed with connection
    if (config.host === 'localhost' && this.isOnMobile()) {
      // Open dialog with disableClose to force configuration
      this.dialog.open(ServerConfigDialogComponent, {
        width: '600px',
        maxWidth: '90vw',
        disableClose: true,
        data: { isInitial: true }
      }).afterClosed().subscribe(() => {
        // After dialog is closed, connect to WebSocket
        this.wsService.connect();
      });
    } else {
      // Already configured or on web - proceed with connection
      this.wsService.connect();
    }
  }

  /**
   * Check if running on mobile platform
   */
  private isOnMobile(): boolean {
    // First check if running as a native app with Capacitor
    if (Capacitor.isNativePlatform()) {
      return true;
    }

    // Fallback: check user agent for mobile browsers
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
   * Open parameters dialog for current module or server configuration
   */
  openModuleSettings(): void {
    // Show server configuration on home or messages page
    const serverConfigRoutes = ['home', 'messages', ''];

    if (serverConfigRoutes.includes(this.currentRoute)) {
      this.openServerConfigDialog();
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

  /**
   * Open server configuration dialog
   */
  openServerConfigDialog(): void {
    this.dialog.open(HomeParametersDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: {}
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();

    // Disconnect from WebSocket
    this.wsService.disconnect();
  }
}
