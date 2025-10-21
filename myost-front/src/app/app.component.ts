import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
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

  private subscription = new Subscription();

  constructor(public wsService: WebsocketService) {}

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
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();

    // Disconnect from WebSocket
    this.wsService.disconnect();
  }
}
