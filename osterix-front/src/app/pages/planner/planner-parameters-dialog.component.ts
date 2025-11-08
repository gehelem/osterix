import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element, GlobalLov } from '../../models/ost.models';

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
      <button mat-icon-button mat-dialog-close class="close-button">
        <mat-icon>close</mat-icon>
      </button>
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
    h2[mat-dialog-title] {
      margin: 0;
      padding: 20px 20px 10px 20px;
      background-color: var(--table-header-bg, #f5f5f5);
      color: var(--table-header-text, #333);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-button {
      margin-left: auto;
    }

    mat-dialog-content {
      padding: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
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

    .toggle-field {
      margin: 8px 0;
      padding: 8px 0;
    }

    mat-slide-toggle {
      display: block;
      margin-bottom: 15px;
    }
  `]
})
export class PlannerParametersDialogComponent {
  devicesKeysCache: string[] = [];
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};

  constructor(
    public dialogRef: MatDialogRef<PlannerParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlannerParametersDialogData
  ) {
    this.initializeCache();
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
