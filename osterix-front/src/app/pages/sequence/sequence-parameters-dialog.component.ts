import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element } from '../../models/ost.models';
import { WebsocketService } from '../../services/websocket.service';
import { SaveProfileDialogComponent } from './save-profile-dialog.component';
import { SelectProfileDialogComponent } from './select-profile-dialog.component';
import { Subscription } from 'rxjs';

export interface SequenceParametersDialogData {
  // Object target properties
  objectName: string;
  objectRA: number;
  objectDEC: number;
  objectEnabled: boolean;

  // Devices properties
  devicesElements: { [key: string]: Element };
  devicesEnabled: boolean;

  // Parameters from 'parameters' property (Advanced options)
  autoFocusAtStart: boolean;
  autoFocusOnFilterChange: boolean;
  focusModule: string;
  suspendGuidingDuringFocus: boolean;
  guiderModule: string;
  guidingSettleTime: number;
  parametersEnabled: boolean;

  // Parameters from 'parms' property (Camera)
  exposure: number;
  gain: number;
  offset: number;
  parmsEnabled: boolean;

  // Optic properties
  opticElements: { [key: string]: Element };
  opticEnabled: boolean;

  // Callbacks for direct changes
  onObjectChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onParametersChange: (name: string, value: any) => void;
  onParmsChange: (name: string, value: any) => void;
  onOpticChange: (name: string, value: any) => void;
}

@Component({
  selector: 'app-sequence-parameters-dialog',
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
      <!-- Tabs -->
      <mat-tab-group animationDuration="0">
        <!-- Object Target Tab -->
        <mat-tab label="Objet cible" *ngIf="data.objectEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">public</mat-icon>
            <span>Objet</span>
          </ng-template>

          <div class="tab-content">
            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Nom</mat-label>
              <input
                matInput
                [(ngModel)]="data.objectName"
                (change)="data.onObjectChange('label', data.objectName)">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>AD (RA)</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.objectRA"
                (change)="data.onObjectChange('ra', data.objectRA)">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>DEC</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.objectDEC"
                (change)="data.onObjectChange('de', data.objectDEC)">
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Devices Tab -->
        <mat-tab label="Appareils" *ngIf="data.devicesEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">devices</mat-icon>
            <span>Appareils</span>
          </ng-template>

          <div class="tab-content">
            <mat-form-field
              appearance="fill"
              class="dialog-field"
              *ngFor="let key of devicesKeysCache">
              <mat-label>{{ data.devicesElements[key].label }}</mat-label>
              <input
                matInput
                [(ngModel)]="data.devicesElements[key].value"
                (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Advanced Parameters Tab -->
        <mat-tab label="Options avancées" *ngIf="data.parametersEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">settings</mat-icon>
            <span>Options avancées</span>
          </ng-template>

          <div class="tab-content">
            <mat-checkbox
              [(ngModel)]="data.autoFocusAtStart"
              (change)="data.onParametersChange('autofocusatstart', data.autoFocusAtStart)">
              Focus au démarrage de la séquence
            </mat-checkbox>

            <mat-checkbox
              [(ngModel)]="data.autoFocusOnFilterChange"
              (change)="data.onParametersChange('autofocusonfilterchange', data.autoFocusOnFilterChange)">
              Focus au changement de filtre
            </mat-checkbox>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Instance de module focus</mat-label>
              <input
                matInput
                [(ngModel)]="data.focusModule"
                (change)="data.onParametersChange('focusmodule', data.focusModule)">
            </mat-form-field>

            <mat-checkbox
              [(ngModel)]="data.suspendGuidingDuringFocus"
              (change)="data.onParametersChange('suspendguidingduringfocus', data.suspendGuidingDuringFocus)">
              Suspendre le guidage pendant le focus
            </mat-checkbox>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Instance de module guidage</mat-label>
              <input
                matInput
                [(ngModel)]="data.guiderModule"
                (change)="data.onParametersChange('guidermodule', data.guiderModule)">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Latence après reprise du guidage (s)</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.guidingSettleTime"
                (change)="data.onParametersChange('guidingsettletime', data.guidingSettleTime)">
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Camera Parameters Tab -->
        <mat-tab label="Paramètres caméra" *ngIf="data.parmsEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">photo_camera</mat-icon>
            <span>Caméra</span>
          </ng-template>

          <div class="tab-content">
            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Exposition (s)</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.exposure"
                (change)="data.onParmsChange('exposure', data.exposure)"
                min="0.00001"
                step="0.001">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Gain</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.gain"
                (change)="data.onParmsChange('gain', data.gain)"
                min="0"
                step="1">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Offset</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.offset"
                (change)="data.onParmsChange('offset', data.offset)"
                min="0"
                step="1">
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Optics Tab -->
        <mat-tab label="Optique" *ngIf="data.opticEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">lens</mat-icon>
            <span>Optique</span>
          </ng-template>

          <div class="tab-content">
            <mat-form-field
              appearance="fill"
              class="dialog-field"
              *ngFor="let key of opticKeysCache">
              <mat-label>{{ data.opticElements[key].label }}</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.opticElements[key].value"
                (change)="data.onOpticChange(key, data.opticElements[key].value)">
            </mat-form-field>
          </div>
        </mat-tab>
      </mat-tab-group>
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

    mat-tab-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .mat-tab-body-wrapper {
      flex: 1;
    }

    .tab-content {
      padding: 20px;
      overflow-y: auto;
    }

    .tab-icon {
      margin-right: 8px;
    }

    .dialog-field {
      width: 100%;
      margin-bottom: 20px;
    }

    mat-checkbox {
      display: block;
      margin-bottom: 15px;
    }
  `]
})
export class SequenceParametersDialogComponent implements OnInit, OnDestroy {
  devicesKeysCache: string[] = [];
  opticKeysCache: string[] = [];
  private stateSubscription: Subscription | null = null;
  private waitingForProfileList = false;
  private profileListTimeout: any = null;
  private pendingTimeouts: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SequenceParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SequenceParametersDialogData,
    private websocketService: WebsocketService,
    private dialog: MatDialog
  ) {
    this.initializeCache();
  }

  ngOnInit(): void {
    // Listen for state changes - ALWAYS update when backend sends updates
    this.stateSubscription = this.websocketService.state$.subscribe(state => {
      const sequencerModule = state.modules['Sequencer'];
      if (!sequencerModule) return;

      // ALWAYS update all properties from the backend state
      // Helper function to update all elements from backend
      const updateElementsFromBackend = (dataElements: { [key: string]: Element }, backendElements: { [key: string]: Element }) => {
        Object.keys(backendElements).forEach(key => {
          const backendElement = backendElements[key];
          if (dataElements[key]) {
            dataElements[key].value = backendElement.value;
          } else {
            dataElements[key] = backendElement;
          }
        });
      };

      // Update parameters - map from elements to simple properties
      const parametersProperty = sequencerModule.properties['parameters'];
      if (parametersProperty && parametersProperty.elements) {
        const elem = parametersProperty.elements;
        if (elem['autofocusatstart']) this.data.autoFocusAtStart = elem['autofocusatstart'].value;
        if (elem['autofocusonfilterchange']) this.data.autoFocusOnFilterChange = elem['autofocusonfilterchange'].value;
        if (elem['focusmodule']) this.data.focusModule = elem['focusmodule'].value;
        if (elem['guidermodule']) this.data.guiderModule = elem['guidermodule'].value;
        if (elem['guidingsettletime']) this.data.guidingSettleTime = elem['guidingsettletime'].value;
        if (elem['suspendguidingduringfocus']) this.data.suspendGuidingDuringFocus = elem['suspendguidingduringfocus'].value;
        console.log('Updated parameters from backend');
      }

      // Update parms (camera exposure, gain, offset)
      const parmsProperty = sequencerModule.properties['parms'];
      if (parmsProperty && parmsProperty.elements) {
        const elem = parmsProperty.elements;
        if (elem['exposure']) this.data.exposure = elem['exposure'].value;
        if (elem['gain']) this.data.gain = elem['gain'].value;
        if (elem['offset']) this.data.offset = elem['offset'].value;
        console.log('Updated parms from backend');
      }

      // Update devices
      const devicesProperty = sequencerModule.properties['devices'];
      if (devicesProperty && devicesProperty.elements) {
        updateElementsFromBackend(this.data.devicesElements, devicesProperty.elements);
      }

      // Update optic
      const opticProperty = sequencerModule.properties['optic'];
      if (opticProperty && opticProperty.elements) {
        updateElementsFromBackend(this.data.opticElements, opticProperty.elements);
      }

      // Handle loadprofile responses (for profile loading dialog)
      if (sequencerModule.properties['loadprofile'] && this.waitingForProfileList) {
        const loadprofileProperty = sequencerModule.properties['loadprofile'];
        const nameElement = loadprofileProperty.elements?.['name'];

        // Check if we received a listOfValues (which means it's a response to Fpreicon)
        if (nameElement && (nameElement as any).listOfValues && Object.keys((nameElement as any).listOfValues).length > 0) {
          console.log('Received profile list:', (nameElement as any).listOfValues);

          // Clear the timeout since we got a response
          if (this.profileListTimeout) {
            clearTimeout(this.profileListTimeout);
            this.profileListTimeout = null;
          }

          // Mark that we're no longer waiting
          this.waitingForProfileList = false;

          // Show dialog with profile selection
          this.showProfileSelectionDialog((nameElement as any).listOfValues);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.profileListTimeout) {
      clearTimeout(this.profileListTimeout);
    }
    // Clear all pending timeouts
    this.pendingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pendingTimeouts = [];
  }

  private showProfileSelectionDialog(profiles: { [key: string]: string }): void {
    const profileNames = Object.keys(profiles);
    console.log('Showing profile selection with profiles:', profileNames);

    this.dialog.open(SelectProfileDialogComponent, {
      width: '500px',
      data: { profiles: profiles }
    }).afterClosed().subscribe((result) => {
      if (result && result.profileName) {
        // Set the profile name to load
        this.websocketService.setProperty('Sequencer', 'loadprofile', {
          name: result.profileName
        });
        console.log('Load profile set to:', result.profileName);

        // Then trigger the load
        const timeout = setTimeout(() => {
          this.websocketService.sendPostIcon('Sequencer', 'loadprofile', { name: {} });
          console.log('Load profile trigger sent');
        }, 100);
        this.pendingTimeouts.push(timeout);
      }
    });
  }

  private initializeCache(): void {
    // Cache devices keys sorted by order
    if (this.data.devicesElements) {
      this.devicesKeysCache = Object.keys(this.data.devicesElements).sort((a, b) => {
        const orderA = this.data.devicesElements[a]?.order || '';
        const orderB = this.data.devicesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });
    }

    // Cache optic keys sorted by order
    if (this.data.opticElements) {
      this.opticKeysCache = Object.keys(this.data.opticElements).sort((a, b) => {
        const orderA = this.data.opticElements[a]?.order || '';
        const orderB = this.data.opticElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });
    }
  }

  loadProfile(): void {
    // Mark that we're waiting for a profile list response
    this.waitingForProfileList = true;

    // Set a timeout - if no response in 5 seconds, abandon
    this.profileListTimeout = setTimeout(() => {
      console.log('Timeout waiting for profile list');
      this.waitingForProfileList = false;
      this.profileListTimeout = null;
    }, 5000);

    // Send the request
    this.websocketService.sendPreIcon('Sequencer', 'loadprofile', { name: {} });
    console.log('Load profile request sent - waiting for list of profiles');
  }

  saveProfile(): void {
    this.websocketService.sendPostIcon('Sequencer', 'saveprofile', { name: {} });
    console.log('Save profile message sent');
  }

  saveAsProfile(): void {
    this.dialog.open(SaveProfileDialogComponent, {
      width: '500px',
      data: { profileName: '' }
    }).afterClosed().subscribe((result) => {
      if (result && result.profileName) {
        // First message: set the profile name
        this.websocketService.setProperty('Sequencer', 'saveprofile', {
          name: result.profileName
        });
        console.log('Save As - Set name message sent:', result.profileName);

        // Then send the save message
        const timeout1 = setTimeout(() => {
          this.websocketService.sendPostIcon('Sequencer', 'saveprofile', { name: {} });
          console.log('Save As - Save message sent');

          // Then refresh the profile list
          const timeout2 = setTimeout(() => {
            this.websocketService.sendPreIcon('Sequencer', 'loadprofile', { name: {} });
            console.log('Save As - Profile list refresh requested');
          }, 100);
          this.pendingTimeouts.push(timeout2);
        }, 100);
        this.pendingTimeouts.push(timeout1);
      }
    });
  }

}
