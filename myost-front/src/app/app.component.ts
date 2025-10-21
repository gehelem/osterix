import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'myost-front';
  connected = false;
  moduleCount = 0;
  isDarkMode = false;
  warningCount = 0;
  errorCount = 0;

  private subscription = new Subscription();

  constructor(
    public wsService: WebsocketService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Connect to WebSocket on app startup
    this.wsService.connect();

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
  }

  /**
   * Toggle dark mode
   */
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();

    // Disconnect from WebSocket
    this.wsService.disconnect();
  }
}
