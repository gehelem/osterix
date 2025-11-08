import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element, GlobalLov } from '../../models/ost.models';
import { WebsocketService } from '../../services/websocket.service';
import { SaveProfileDialogComponent } from '../sequence/save-profile-dialog.component';
import { SelectProfileDialogComponent } from '../sequence/select-profile-dialog.component';
import { Subscription } from 'rxjs';

export interface PlannerParametersDialogData {
  // Object properties
  objectName: string;
  objectRA: number;
  objectDEC: number;
  objectEnabled: boolean;
  currentProfile: string;

  // Devices
  devicesElements: { [key: string]: Element };
  devicesEnabled: boolean;

  // Parameters
  navigatorModule: string;
  sequenceModule: string;
  parametersEnabled: boolean;

  // Global LOVs from module
  globallovs: { [key: string]: GlobalLov };

  // Callbacks for direct changes
  onObjectChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onParametersChange: (name: string, value: any) => void;
  onProfileChange: (value: string) => void;
}

interface ListOfValue {
  value: string;
  label: string;
}

@Component({
  selector: 'app-planner-parameters-dialog',
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
        <!-- Object Tab -->
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

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Profil</mat-label>
              <input
                matInput
                [(ngModel)]="data.currentProfile"
                (change)="data.onProfileChange(data.currentProfile)">
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Devices Tab -->
        <mat-tab label="Périphériques" *ngIf="hasDevices()">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">devices</mat-icon>
            <span>Appareils</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of devicesKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key)">
                <mat-label>{{ getElementLabel(key) }}</mat-label>
                <mat-select
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key)" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key)">
                <mat-label>{{ getElementLabel(key) }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key)">
                <mat-label>{{ getElementLabel(key) }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key)">
                <mat-slide-toggle
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
                  {{ getElementLabel(key) }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <!-- Parameters Tab -->
        <mat-tab label="Paramètres" *ngIf="data.parametersEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">tune</mat-icon>
            <span>Paramètres</span>
          </ng-template>

          <div class="tab-content">
            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Instance Navigator</mat-label>
              <input
                matInput
                [(ngModel)]="data.navigatorModule"
                (change)="data.onParametersChange('navigatormodule', data.navigatorModule)">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Instance Sequencer</mat-label>
              <input
                matInput
                [(ngModel)]="data.sequenceModule"
                (change)="data.onParametersChange('sequencemodule', data.sequenceModule)">
            </mat-form-field>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--content-bg, #f5f5f5);
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 16px 20px;
      background-color: var(--table-header-bg, #f5f5f5);
      color: var(--table-header-text, #333);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--panel-border, #ddd);
      flex-shrink: 0;
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
      padding: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      flex: 1;
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
      overflow-y: auto;
    }

    :host ::ng-deep .mat-tab-header {
      background-color: var(--panel-bg, #ffffff);
      border-bottom: 1px solid var(--panel-border, #ddd);
    }

    :host ::ng-deep .mat-tab-label {
      color: var(--primary-text, #333);
    }

    :host ::ng-deep .mat-tab-label-active {
      color: var(--active-color, #1976d2);
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

    .toggle-field {
      margin: 8px 0;
      padding: 8px 0;
    }

    mat-slide-toggle {
      display: block;
      margin-bottom: 15px;
    }

    mat-form-field {
      width: 100%;
    }

    mat-select {
      width: 100%;
    }
  `]
})
export class PlannerParametersDialogComponent implements OnInit, OnDestroy {
  devicesKeysCache: string[] = [];
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};

  private stateSubscription: Subscription | null = null;
  private waitingForProfileList = false;
  private profileListTimeout: any = null;
  private pendingTimeouts: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PlannerParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlannerParametersDialogData,
    private websocketService: WebsocketService,
    private dialog: MatDialog
  ) {
    this.initializeCache();
  }

  ngOnInit(): void {
    // Listen for state changes to handle loadprofile responses
    this.stateSubscription = this.websocketService.state$.subscribe(state => {
      // Only process if we're waiting for a profile list
      if (!this.waitingForProfileList) {
        return;
      }

      const plannerModule = state.modules['Planner'];
      if (plannerModule && plannerModule.properties && plannerModule.properties['loadprofile']) {
        const loadprofileProperty = plannerModule.properties['loadprofile'];
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
    this.websocketService.sendPreIcon('Planner', 'loadprofile', { name: {} });
    console.log('Load profile request sent - waiting for list of profiles');
  }

  saveProfile(): void {
    this.websocketService.sendPostIcon('Planner', 'saveprofile', { name: {} });
    console.log('Save profile message sent');
  }

  saveAsProfile(): void {
    this.dialog.open(SaveProfileDialogComponent, {
      width: '500px',
      data: { profileName: '' }
    }).afterClosed().subscribe((result) => {
      if (result && result.profileName) {
        // First message: set the profile name
        this.websocketService.setProperty('Planner', 'saveprofile', {
          name: result.profileName
        });
        console.log('Save As - Set name message sent:', result.profileName);

        // Then send the save message
        const timeout1 = setTimeout(() => {
          this.websocketService.sendPostIcon('Planner', 'saveprofile', { name: {} });
          console.log('Save As - Save message sent');

          // Then refresh the profile list
          const timeout2 = setTimeout(() => {
            this.websocketService.sendPreIcon('Planner', 'loadprofile', { name: {} });
            console.log('Save As - Profile list refresh requested');
          }, 100);
          this.pendingTimeouts.push(timeout2);
        }, 100);
        this.pendingTimeouts.push(timeout1);
      }
    });
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
        this.websocketService.setProperty('Planner', 'loadprofile', {
          name: result.profileName
        });
        console.log('Load profile set to:', result.profileName);

        // Then trigger the load
        const timeout = setTimeout(() => {
          this.websocketService.sendPostIcon('Planner', 'loadprofile', { name: {} });
          console.log('Load profile trigger sent');
        }, 100);
        this.pendingTimeouts.push(timeout);
      }
    });
  }

  private initializeCache(): void {
    if (this.data.devicesElements) {
      this.devicesKeysCache = Object.keys(this.data.devicesElements).sort((a, b) => {
        const orderA = this.data.devicesElements[a]?.order || '';
        const orderB = this.data.devicesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      this.devicesKeysCache.forEach(key => {
        this.devicesLovsCache[key] = this.computeElementLovs(key);
      });
    }
  }

  private computeElementLovs(key: string): ListOfValue[] {
    const element = this.data.devicesElements[key];
    if (!element) return [];

    // Check for globallov reference
    const globallovRef = (element as any).globallov;
    if (globallovRef && this.data.globallovs?.[globallovRef]) {
      const globalLov = this.data.globallovs[globallovRef];
      if (!globalLov.values) return [];
      return Object.keys(globalLov.values).map(k => ({
        value: k,
        label: globalLov.values[k]
      }));
    }

    // Check for local listOfValues
    const lovs = (element as any).listOfValues;
    if (!lovs) return [];

    if (Array.isArray(lovs)) {
      return lovs;
    } else {
      return Object.keys(lovs).map(k => ({
        value: k,
        label: lovs[k]
      }));
    }
  }

  hasDevices(): boolean {
    return this.data.devicesElements && Object.keys(this.data.devicesElements).length > 0;
  }

  getElementLabel(key: string): string {
    const element = this.data.devicesElements[key];
    return element?.label || key;
  }

  isStringWithLov(key: string): boolean {
    const element = this.data.devicesElements[key];
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return hasLocalLov || hasGlobalLov;
  }

  isStringWithoutLov(key: string): boolean {
    const element = this.data.devicesElements[key];
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return !hasLocalLov && !hasGlobalLov;
  }

  isNumeric(key: string): boolean {
    const element = this.data.devicesElements[key];
    return element?.type === 'int' || element?.type === 'float';
  }

  isBool(key: string): boolean {
    const element = this.data.devicesElements[key];
    return element?.type === 'bool';
  }

  getElementLovs(key: string): ListOfValue[] {
    return this.devicesLovsCache[key] || [];
  }
}
