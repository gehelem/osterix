import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element, GlobalLov } from '../../models/ost.models';

export interface ParametersDialogData {
  // Camera parameters from 'parms' property
  exposure: number;
  gain: number;
  offset: number;
  parmsEnabled: boolean;

  // Centering parameters from 'centeringparams' property
  maxIterations: number;
  tolerance: number;
  centeringEnabled: boolean;

  // Devices and optic properties
  devicesElements: { [key: string]: Element };
  devicesEnabled: boolean;
  opticElements: { [key: string]: Element };
  opticEnabled: boolean;

  // Global LOVs from module
  globallovs: { [key: string]: GlobalLov };

  // Callbacks for direct changes
  onParmsChange: (name: string, value: any) => void;
  onCenteringChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onOpticChange: (name: string, value: any) => void;
}

interface ListOfValue {
  value: string;
  label: string;
}

@Component({
  selector: 'app-navigator-parameters-dialog',
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
                step="0.1">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Gain</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.gain"
                (change)="data.onParmsChange('gain', data.gain)">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Offset</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.offset"
                (change)="data.onParmsChange('offset', data.offset)">
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Centering Parameters Tab -->
        <mat-tab label="Paramètres de centrage" *ngIf="data.centeringEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">target</mat-icon>
            <span>Centrage</span>
          </ng-template>

          <div class="tab-content">
            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Itérations max</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.maxIterations"
                (change)="data.onCenteringChange('maxiterations', data.maxIterations)">
            </mat-form-field>

            <mat-form-field appearance="fill" class="dialog-field">
              <mat-label>Tolérance (pixels)</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="data.tolerance"
                (change)="data.onCenteringChange('tolerance', data.tolerance)"
                step="0.1">
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
                *ngIf="isStringWithLov(key, 'devices')">
                <mat-label>{{ getElementLabel(key, 'devices') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'devices')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'devices')">
                <mat-label>{{ getElementLabel(key, 'devices') }}</mat-label>
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
                *ngIf="isNumeric(key, 'devices')">
                <mat-label>{{ getElementLabel(key, 'devices') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'devices')">
                <mat-slide-toggle
                  [(ngModel)]="data.devicesElements[key].value"
                  [name]="'devices_' + key"
                  (change)="data.onDevicesChange(key, data.devicesElements[key].value)">
                  {{ getElementLabel(key, 'devices') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <!-- Optics Tab -->
        <mat-tab label="Optique" *ngIf="hasOptic()">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">lens</mat-icon>
            <span>Optique</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of opticKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key, 'optic')">
                <mat-label>{{ getElementLabel(key, 'optic') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.opticElements[key].value"
                  [name]="'optic_' + key"
                  (change)="data.onOpticChange(key, data.opticElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'optic')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'optic')">
                <mat-label>{{ getElementLabel(key, 'optic') }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.opticElements[key].value"
                  [name]="'optic_' + key"
                  (change)="data.onOpticChange(key, data.opticElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key, 'optic')">
                <mat-label>{{ getElementLabel(key, 'optic') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.opticElements[key].value"
                  [name]="'optic_' + key"
                  (change)="data.onOpticChange(key, data.opticElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'optic')">
                <mat-slide-toggle
                  [(ngModel)]="data.opticElements[key].value"
                  [name]="'optic_' + key"
                  (change)="data.onOpticChange(key, data.opticElements[key].value)">
                  {{ getElementLabel(key, 'optic') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
  `,
  styles: [`
    h2[mat-dialog-title] {
      margin: 0;
      padding: 20px 20px 10px 20px;
      background-color: #f5f5f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-button {
      margin-left: auto;
    }

    mat-dialog-content {
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      flex: 1;
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
      display: block;
      margin: 15px 0;
    }

    mat-slide-toggle {
      display: block;
      margin-bottom: 15px;
    }
  `]
})
export class NavigatorParametersDialogComponent {
  // Cache all computed values to prevent change detection loops
  devicesKeysCache: string[] = [];
  opticKeysCache: string[] = [];
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};
  opticLovsCache: { [key: string]: ListOfValue[] } = {};

  constructor(
    public dialogRef: MatDialogRef<NavigatorParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParametersDialogData
  ) {
    // Initialize all cached values in constructor
    this.initializeCaches();
  }

  private initializeCaches(): void {
    // Cache devices keys
    if (this.data.devicesElements) {
      this.devicesKeysCache = Object.keys(this.data.devicesElements).sort((a, b) => {
        const orderA = this.data.devicesElements[a]?.order || '';
        const orderB = this.data.devicesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs for each device element
      this.devicesKeysCache.forEach(key => {
        this.devicesLovsCache[key] = this.computeElementLovs(key, 'devices');
      });
    }

    // Cache optic keys
    if (this.data.opticElements) {
      this.opticKeysCache = Object.keys(this.data.opticElements).sort((a, b) => {
        const orderA = this.data.opticElements[a]?.order || '';
        const orderB = this.data.opticElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs for each optic element
      this.opticKeysCache.forEach(key => {
        this.opticLovsCache[key] = this.computeElementLovs(key, 'optic');
      });
    }
  }

  private computeElementLovs(key: string, type: 'devices' | 'optic'): ListOfValue[] {
    const element = this.getElement(key, type);
    if (!element) return [];

    // First check for globallov reference
    const globallovRef = (element as any).globallov;
    if (globallovRef && this.data.globallovs?.[globallovRef]) {
      const globalLov = this.data.globallovs[globallovRef];
      if (!globalLov.values) return [];
      return Object.keys(globalLov.values).map(k => ({
        value: k,
        label: globalLov.values[k]
      }));
    }

    // Otherwise check for local listOfValues
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

  hasOptic(): boolean {
    return this.data.opticElements && Object.keys(this.data.opticElements).length > 0;
  }

  getDevicesKeys(): string[] {
    return this.devicesKeysCache;
  }

  getOpticKeys(): string[] {
    return this.opticKeysCache;
  }

  getElement(key: string, type: 'devices' | 'optic'): Element | null {
    const elements = type === 'devices' ? this.data.devicesElements : this.data.opticElements;
    return elements?.[key] || null;
  }

  getElementLabel(key: string, type: 'devices' | 'optic'): string {
    const element = this.getElement(key, type);
    return element?.label || key;
  }

  isStringWithLov(key: string, type: 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return hasLocalLov || hasGlobalLov;
  }

  isStringWithoutLov(key: string, type: 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return !hasLocalLov && !hasGlobalLov;
  }

  isNumeric(key: string, type: 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'int' || element?.type === 'float';
  }

  isBool(key: string, type: 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'bool';
  }

  getElementLovs(key: string, type: 'devices' | 'optic'): ListOfValue[] {
    const cache = type === 'devices' ? this.devicesLovsCache : this.opticLovsCache;
    return cache[key] || [];
  }

}
