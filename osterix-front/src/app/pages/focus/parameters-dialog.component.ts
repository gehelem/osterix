import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element, GlobalLov } from '../../models/ost.models';

export interface ParametersDialogData {
  // Parameters from 'parameters' property
  iterations: number;
  startpos: number;
  steps: number;
  backlash: number;
  aroundinitial: boolean;
  zoning: number;
  zoningOptions: Array<{value: number, label: string}>;
  parametersEnabled: boolean;

  // Parameters from 'parms' property
  exposure: number;
  gain: number;
  offset: number;
  parmsEnabled: boolean;

  // Devices and optic properties
  devicesElements: { [key: string]: Element };
  devicesEnabled: boolean;
  opticElements: { [key: string]: Element };
  opticEnabled: boolean;

  // Global LOVs from module
  globallovs: { [key: string]: GlobalLov };

  // Callbacks for direct changes
  onParameterChange: (name: string, value: any) => void;
  onParmsChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onOpticChange: (name: string, value: any) => void;
}

interface ListOfValue {
  value: string;
  label: string;
}

@Component({
  selector: 'app-parameters-dialog',
  template: `
    <h2 mat-dialog-title>
      Paramètres
      <button mat-icon-button mat-dialog-close class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content>
      <mat-tab-group animationDuration="0">
        <!-- Parameters Tab -->
        <mat-tab *ngIf="data.parametersEnabled" label="Paramètres">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">tune</mat-icon>
            <span>Paramètres</span>
          </ng-template>
          <div class="tab-content">
            <form class="focus-form">
              <mat-form-field appearance="fill">
                <mat-label>Itérations</mat-label>
                <input matInput type="number" [(ngModel)]="data.iterations" name="iterations"
                       (ngModelChange)="data.onParameterChange('iterations', $event)">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Position de démarrage</mat-label>
                <input matInput type="number" [(ngModel)]="data.startpos" name="startpos"
                       (ngModelChange)="data.onParameterChange('startpos', $event)">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Intervalle de pas</mat-label>
                <input matInput type="number" [(ngModel)]="data.steps" name="steps"
                       (ngModelChange)="data.onParameterChange('steps', $event)">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Backlash</mat-label>
                <input matInput type="number" [(ngModel)]="data.backlash" name="backlash"
                       (ngModelChange)="data.onParameterChange('backlash', $event)">
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle [(ngModel)]="data.aroundinitial" name="aroundinitial"
                                  (ngModelChange)="data.onParameterChange('aroundinitial', $event)">
                  Autour de la position initiale
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="fill">
                <mat-label>Zoning</mat-label>
                <mat-select [(ngModel)]="data.zoning" name="zoning"
                            (ngModelChange)="data.onParameterChange('zoning', $event)">
                  <mat-option *ngFor="let option of data.zoningOptions" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </form>
          </div>
        </mat-tab>

        <!-- Parms Tab (Camera parameters) -->
        <mat-tab *ngIf="data.parmsEnabled" label="Caméra">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">camera</mat-icon>
            <span>Caméra</span>
          </ng-template>
          <div class="tab-content">
            <form class="focus-form">
              <mat-form-field appearance="fill">
                <mat-label>Exposition (s)</mat-label>
                <input matInput type="number" [(ngModel)]="data.exposure" name="exposure" step="0.1"
                       (ngModelChange)="data.onParmsChange('exposure', $event)">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Gain</mat-label>
                <input matInput type="number" [(ngModel)]="data.gain" name="gain"
                       (ngModelChange)="data.onParmsChange('gain', $event)">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Offset</mat-label>
                <input matInput type="number" [(ngModel)]="data.offset" name="offset"
                       (ngModelChange)="data.onParmsChange('offset', $event)">
              </mat-form-field>
            </form>
          </div>
        </mat-tab>

        <!-- Devices Tab -->
        <mat-tab *ngIf="hasDevices()" label="Appareils">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">devices</mat-icon>
            <span>Appareils</span>
          </ng-template>
          <div class="tab-content">
            <form class="focus-form">
              <ng-container *ngFor="let key of getDevicesKeys()">
                <mat-form-field appearance="fill" *ngIf="isStringWithLov(key, 'devices')">
                  <mat-label>{{ getElementLabel(key, 'devices') }}</mat-label>
                  <mat-select [(ngModel)]="data.devicesElements[key].value" [name]="'devices_' + key"
                              (ngModelChange)="data.onDevicesChange(key, $event)"
                              [disabled]="!data.devicesEnabled">
                    <mat-option *ngFor="let option of getElementLovs(key, 'devices')" [value]="option.value">
                      {{ option.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="fill" *ngIf="isStringWithoutLov(key, 'devices')">
                  <mat-label>{{ getElementLabel(key, 'devices') }}</mat-label>
                  <input matInput type="text" [(ngModel)]="data.devicesElements[key].value" [name]="'devices_' + key"
                         (ngModelChange)="data.onDevicesChange(key, $event)"
                         [disabled]="!data.devicesEnabled">
                </mat-form-field>

                <mat-form-field appearance="fill" *ngIf="isNumeric(key, 'devices')">
                  <mat-label>{{ getElementLabel(key, 'devices') }}</mat-label>
                  <input matInput type="number" [(ngModel)]="data.devicesElements[key].value" [name]="'devices_' + key"
                         (ngModelChange)="data.onDevicesChange(key, $event)"
                         [disabled]="!data.devicesEnabled">
                </mat-form-field>

                <div class="toggle-field" *ngIf="isBool(key, 'devices')">
                  <mat-slide-toggle [(ngModel)]="data.devicesElements[key].value" [name]="'devices_' + key"
                                    (ngModelChange)="data.onDevicesChange(key, $event)"
                                    [disabled]="!data.devicesEnabled">
                    {{ getElementLabel(key, 'devices') }}
                  </mat-slide-toggle>
                </div>
              </ng-container>
            </form>
          </div>
        </mat-tab>

        <!-- Optic Tab -->
        <mat-tab *ngIf="hasOptic()" label="Optique">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">lens</mat-icon>
            <span>Optique</span>
          </ng-template>
          <div class="tab-content">
            <form class="focus-form">
              <ng-container *ngFor="let key of getOpticKeys()">
                <mat-form-field appearance="fill" *ngIf="isStringWithLov(key, 'optic')">
                  <mat-label>{{ getElementLabel(key, 'optic') }}</mat-label>
                  <mat-select [(ngModel)]="data.opticElements[key].value" [name]="'optic_' + key"
                              (ngModelChange)="data.onOpticChange(key, $event)"
                              [disabled]="!data.opticEnabled">
                    <mat-option *ngFor="let option of getElementLovs(key, 'optic')" [value]="option.value">
                      {{ option.label }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="fill" *ngIf="isStringWithoutLov(key, 'optic')">
                  <mat-label>{{ getElementLabel(key, 'optic') }}</mat-label>
                  <input matInput type="text" [(ngModel)]="data.opticElements[key].value" [name]="'optic_' + key"
                         (ngModelChange)="data.onOpticChange(key, $event)"
                         [disabled]="!data.opticEnabled">
                </mat-form-field>

                <mat-form-field appearance="fill" *ngIf="isNumeric(key, 'optic')">
                  <mat-label>{{ getElementLabel(key, 'optic') }}</mat-label>
                  <input matInput type="number" [(ngModel)]="data.opticElements[key].value" [name]="'optic_' + key"
                         (ngModelChange)="data.onOpticChange(key, $event)"
                         [disabled]="!data.opticEnabled">
                </mat-form-field>

                <div class="toggle-field" *ngIf="isBool(key, 'optic')">
                  <mat-slide-toggle [(ngModel)]="data.opticElements[key].value" [name]="'optic_' + key"
                                    (ngModelChange)="data.onOpticChange(key, $event)"
                                    [disabled]="!data.opticEnabled">
                    {{ getElementLabel(key, 'optic') }}
                  </mat-slide-toggle>
                </div>
              </ng-container>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;
      padding: 8px 16px;
    }

    .close-button {
      margin-left: auto;
    }

    mat-dialog-content {
      padding: 0;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    mat-tab-group {
      flex: 1;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-tab-group .mat-mdc-tab-body-wrapper {
      height: 100%;
    }

    ::ng-deep .mat-mdc-tab-body {
      height: 100%;
    }

    .tab-content {
      padding: 24px;
      overflow-y: auto;
      height: 100%;
    }

    .focus-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .focus-form mat-form-field {
      width: 100%;
    }

    .toggle-field {
      margin: 8px 0;
      padding: 8px 0;
    }

    .tab-icon {
      margin-right: 8px;
    }
  `]
})
export class ParametersDialogComponent {
  // Cache all computed values to prevent change detection loops
  devicesKeysCache: string[] = [];
  opticKeysCache: string[] = [];
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};
  opticLovsCache: { [key: string]: ListOfValue[] } = {};

  constructor(
    public dialogRef: MatDialogRef<ParametersDialogComponent>,
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
