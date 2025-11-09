import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../services/websocket.service';
import { SaveProfileDialogComponent } from '../sequence/save-profile-dialog.component';
import { SelectProfileDialogComponent } from '../sequence/select-profile-dialog.component';

@Component({
  selector: 'app-home-parameters-dialog',
  template: `
    <h2 mat-dialog-title>
      Paramètres
      <div class="header-actions">
        <button mat-icon-button title="Load" (click)="loadProfile()">
          <mat-icon>folder_open</mat-icon>
        </button>
        <button mat-icon-button title="Save" (click)="saveProfile()">
          <mat-icon>save</mat-icon>
        </button>
        <button mat-icon-button title="Save As" (click)="saveAsProfile()">
          <mat-icon>save_as</mat-icon>
        </button>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </h2>
    <mat-dialog-content>
      <!-- Content to be added -->
    </mat-dialog-content>
  `,
  styles: [`
    h2[mat-dialog-title] {
      margin: 0;
      padding: 20px 20px 10px 20px;
      background-color: var(--table-header-bg, #f5f5f5);
      color: var(--table-header-text, #333);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;
    }

    .close-button {
      margin-left: 8px;
    }

    mat-dialog-content {
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      background-color: var(--content-bg, #f5f5f5);
      color: var(--primary-text, #333);
    }
  `]
})
export class HomeParametersDialogComponent implements OnInit, OnDestroy {
  private pendingTimeouts: any[] = [];
  private stateSubscription?: Subscription;
  private waitingForProfileList = false;
  private profileListTimeout: any = null;
  private lastReceivedConfigurations: { [key: string]: string } | null = null;
  private configurationListTimeout: any = null;

  constructor(
    public dialogRef: MatDialogRef<HomeParametersDialogComponent>,
    private websocketService: WebsocketService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Listen for state changes to handle loadconf responses
    this.stateSubscription = this.websocketService.state$.subscribe(state => {
      // Only process if we're waiting for a configuration list
      if (!this.waitingForProfileList) {
        return;
      }

      const mainctlModule = state.modules['mainctl'];
      if (mainctlModule && mainctlModule.properties && mainctlModule.properties['loadconf']) {
        const loadconfProperty = mainctlModule.properties['loadconf'];
        const nameElement = loadconfProperty.elements?.['name'];

        // Check if we received a listOfValues (which means it's a response to Fpreicon)
        if (nameElement && (nameElement as any).listOfValues && Object.keys((nameElement as any).listOfValues).length > 0) {
          console.log('Received configuration list:', (nameElement as any).listOfValues);

          // Store the latest configuration list
          this.lastReceivedConfigurations = (nameElement as any).listOfValues;

          // Clear the previous 200ms timeout if it exists
          if (this.configurationListTimeout) {
            clearTimeout(this.configurationListTimeout);
          }

          // Set a new 200ms timeout to collect the latest response
          this.configurationListTimeout = setTimeout(() => {
            if (this.lastReceivedConfigurations) {
              console.log('Showing dialog with latest configuration list:', this.lastReceivedConfigurations);

              // Clear the 5 second timeout since we got a response
              if (this.profileListTimeout) {
                clearTimeout(this.profileListTimeout);
                this.profileListTimeout = null;
              }

              // Mark that we're no longer waiting
              this.waitingForProfileList = false;

              // Show dialog with configuration selection
              this.showConfigurationSelectionDialog(this.lastReceivedConfigurations);
              this.lastReceivedConfigurations = null;
            }
          }, 200);
        }
      }
    });
  }

  loadProfile(): void {
    // Mark that we're waiting for a configuration list response
    this.waitingForProfileList = true;

    // Set a timeout - if no response in 5 seconds, abandon
    this.profileListTimeout = setTimeout(() => {
      console.log('Timeout waiting for configuration list');
      this.waitingForProfileList = false;
      this.profileListTimeout = null;
    }, 5000);

    // Send the request
    this.websocketService.sendPreIcon('mainctl', 'loadconf', { name: {} });
    console.log('Load configuration request sent - waiting for list of configurations');
  }

  saveProfile(): void {
    this.websocketService.sendPostIcon('mainctl', 'saveconf', { name: {} });
    console.log('Save configuration message sent');
  }

  saveAsProfile(): void {
    this.dialog.open(SaveProfileDialogComponent, {
      width: '500px',
      data: { profileName: '', title: 'Enregistrer la configuration', inputLabel: 'Nom de la configuration' }
    }).afterClosed().subscribe((result) => {
      if (result && result.profileName) {
        // First message: set the configuration name
        this.websocketService.setProperty('mainctl', 'saveconf', {
          name: result.profileName
        });
        console.log('Save As - Set name message sent:', result.profileName);

        // Then send the save message
        const timeout = setTimeout(() => {
          this.websocketService.sendPostIcon('mainctl', 'saveconf', { name: {} });
          console.log('Save As - Save message sent');
        }, 100);
        this.pendingTimeouts.push(timeout);
      }
    });
  }

  private showConfigurationSelectionDialog(configurations: { [key: string]: string }): void {
    const configurationNames = Object.keys(configurations);
    console.log('Showing configuration selection with configurations:', configurationNames);

    this.dialog.open(SelectProfileDialogComponent, {
      width: '500px',
      data: { profiles: configurations }
    }).afterClosed().subscribe((result) => {
      if (result && result.profileName) {
        // Set the configuration name to load
        this.websocketService.setProperty('mainctl', 'loadconf', {
          name: result.profileName
        });
        console.log('Load configuration set to:', result.profileName);

        // Then trigger the load
        const timeout = setTimeout(() => {
          this.websocketService.sendPostIcon('mainctl', 'loadconf', { name: {} });
          console.log('Load configuration trigger sent');
        }, 100);
        this.pendingTimeouts.push(timeout);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    // Clear timeout if waiting for list
    if (this.profileListTimeout) {
      clearTimeout(this.profileListTimeout);
    }
    // Clear timeout for collecting configuration responses
    if (this.configurationListTimeout) {
      clearTimeout(this.configurationListTimeout);
    }
    // Clear all pending timeouts
    this.pendingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pendingTimeouts = [];
  }
}
