import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element, GlobalLov } from '../../models/ost.models';

export interface ParametersDialogData {
  // Parameters from 'parameters' property
  parametersElements: { [key: string]: Element };
  parametersEnabled: boolean;

  // Devices and optic properties
  devicesElements: { [key: string]: Element };
  devicesEnabled: boolean;
  opticElements: { [key: string]: Element };
  opticEnabled: boolean;

  // Guiding parameters (guideParams property)
  guideParamsElements: { [key: string]: Element };
  guideParamsEnabled: boolean;

  // Calibration parameters (calParams property)
  calParamsElements: { [key: string]: Element };
  calParamsEnabled: boolean;

  // Disabled corrections (disCorrections property)
  disCorrectionElements: { [key: string]: Element };
  disCorrectionEnabled: boolean;

  // Reversed corrections (revCorrections property)
  revCorrectionElements: { [key: string]: Element };
  revCorrectionEnabled: boolean;

  // Global LOVs from module
  globallovs: { [key: string]: GlobalLov };

  // Callbacks for direct changes
  onParametersChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onOpticChange: (name: string, value: any) => void;
  onGuideParamsChange: (name: string, value: any) => void;
  onCalParamsChange: (name: string, value: any) => void;
  onDisCorrectionChange: (name: string, value: any) => void;
  onRevCorrectionChange: (name: string, value: any) => void;
}

interface ListOfValue {
  value: string;
  label: string;
}

@Component({
  selector: 'app-guider-parameters-dialog',
  template: `
    <h2 mat-dialog-title>Paramètres</h2>
    <mat-dialog-content>
      <!-- Tabs -->
      <mat-tab-group animationDuration="0">
        <!-- Parameters Tab -->
        <mat-tab label="Paramètres" *ngIf="data.parametersEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">tune</mat-icon>
            <span>Paramètres</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of parametersKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key, 'parameters')">
                <mat-label>{{ getElementLabel(key, 'parameters') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.parametersElements[key].value"
                  [name]="'parameters_' + key"
                  (change)="data.onParametersChange(key, data.parametersElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'parameters')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'parameters')">
                <mat-label>{{ getElementLabel(key, 'parameters') }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.parametersElements[key].value"
                  [name]="'parameters_' + key"
                  (change)="data.onParametersChange(key, data.parametersElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key, 'parameters')">
                <mat-label>{{ getElementLabel(key, 'parameters') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.parametersElements[key].value"
                  [name]="'parameters_' + key"
                  (change)="data.onParametersChange(key, data.parametersElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'parameters')">
                <mat-slide-toggle
                  [(ngModel)]="data.parametersElements[key].value"
                  [name]="'parameters_' + key"
                  (change)="data.onParametersChange(key, data.parametersElements[key].value)">
                  {{ getElementLabel(key, 'parameters') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <!-- Guide Parameters Tab -->
        <mat-tab label="Guidage" *ngIf="data.guideParamsEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">videogame_asset</mat-icon>
            <span>Guidage</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of guideParamsKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key, 'guideParams')">
                <mat-label>{{ getElementLabel(key, 'guideParams') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.guideParamsElements[key].value"
                  [name]="'guideParams_' + key"
                  (change)="data.onGuideParamsChange(key, data.guideParamsElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'guideParams')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'guideParams')">
                <mat-label>{{ getElementLabel(key, 'guideParams') }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.guideParamsElements[key].value"
                  [name]="'guideParams_' + key"
                  (change)="data.onGuideParamsChange(key, data.guideParamsElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key, 'guideParams')">
                <mat-label>{{ getElementLabel(key, 'guideParams') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.guideParamsElements[key].value"
                  [name]="'guideParams_' + key"
                  (change)="data.onGuideParamsChange(key, data.guideParamsElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'guideParams')">
                <mat-slide-toggle
                  [(ngModel)]="data.guideParamsElements[key].value"
                  [name]="'guideParams_' + key"
                  (change)="data.onGuideParamsChange(key, data.guideParamsElements[key].value)">
                  {{ getElementLabel(key, 'guideParams') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <!-- Calibration Parameters Tab -->
        <mat-tab label="Calibration" *ngIf="data.calParamsEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">straighten</mat-icon>
            <span>Calibration</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of calParamsKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key, 'calParams')">
                <mat-label>{{ getElementLabel(key, 'calParams') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.calParamsElements[key].value"
                  [name]="'calParams_' + key"
                  (change)="data.onCalParamsChange(key, data.calParamsElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'calParams')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'calParams')">
                <mat-label>{{ getElementLabel(key, 'calParams') }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.calParamsElements[key].value"
                  [name]="'calParams_' + key"
                  (change)="data.onCalParamsChange(key, data.calParamsElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key, 'calParams')">
                <mat-label>{{ getElementLabel(key, 'calParams') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.calParamsElements[key].value"
                  [name]="'calParams_' + key"
                  (change)="data.onCalParamsChange(key, data.calParamsElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'calParams')">
                <mat-slide-toggle
                  [(ngModel)]="data.calParamsElements[key].value"
                  [name]="'calParams_' + key"
                  (change)="data.onCalParamsChange(key, data.calParamsElements[key].value)">
                  {{ getElementLabel(key, 'calParams') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <!-- Devices Tab -->
        <mat-tab label="Appareils" *ngIf="hasDevices()">
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

        <!-- Optic Tab -->
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

        <!-- Disabled Corrections Tab -->
        <mat-tab label="Corrections désactivées" *ngIf="data.disCorrectionEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">block</mat-icon>
            <span>Corrections</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of disCorrectionKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key, 'disCorrection')">
                <mat-label>{{ getElementLabel(key, 'disCorrection') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.disCorrectionElements[key].value"
                  [name]="'disCorrection_' + key"
                  (change)="data.onDisCorrectionChange(key, data.disCorrectionElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'disCorrection')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'disCorrection')">
                <mat-label>{{ getElementLabel(key, 'disCorrection') }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.disCorrectionElements[key].value"
                  [name]="'disCorrection_' + key"
                  (change)="data.onDisCorrectionChange(key, data.disCorrectionElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key, 'disCorrection')">
                <mat-label>{{ getElementLabel(key, 'disCorrection') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.disCorrectionElements[key].value"
                  [name]="'disCorrection_' + key"
                  (change)="data.onDisCorrectionChange(key, data.disCorrectionElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'disCorrection')">
                <mat-slide-toggle
                  [(ngModel)]="data.disCorrectionElements[key].value"
                  [name]="'disCorrection_' + key"
                  (change)="data.onDisCorrectionChange(key, data.disCorrectionElements[key].value)">
                  {{ getElementLabel(key, 'disCorrection') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <!-- Reversed Corrections Tab -->
        <mat-tab label="Corrections inversées" *ngIf="data.revCorrectionEnabled">
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">swap_horiz</mat-icon>
            <span>Inversées</span>
          </ng-template>

          <div class="tab-content">
            <ng-container *ngFor="let key of revCorrectionKeysCache">
              <!-- String with LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithLov(key, 'revCorrection')">
                <mat-label>{{ getElementLabel(key, 'revCorrection') }}</mat-label>
                <mat-select
                  [(ngModel)]="data.revCorrectionElements[key].value"
                  [name]="'revCorrection_' + key"
                  (change)="data.onRevCorrectionChange(key, data.revCorrectionElements[key].value)">
                  <mat-option *ngFor="let option of getElementLovs(key, 'revCorrection')" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- String without LOV -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isStringWithoutLov(key, 'revCorrection')">
                <mat-label>{{ getElementLabel(key, 'revCorrection') }}</mat-label>
                <input
                  matInput
                  type="text"
                  [(ngModel)]="data.revCorrectionElements[key].value"
                  [name]="'revCorrection_' + key"
                  (change)="data.onRevCorrectionChange(key, data.revCorrectionElements[key].value)">
              </mat-form-field>

              <!-- Numeric -->
              <mat-form-field
                appearance="fill"
                class="dialog-field"
                *ngIf="isNumeric(key, 'revCorrection')">
                <mat-label>{{ getElementLabel(key, 'revCorrection') }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="data.revCorrectionElements[key].value"
                  [name]="'revCorrection_' + key"
                  (change)="data.onRevCorrectionChange(key, data.revCorrectionElements[key].value)">
              </mat-form-field>

              <!-- Boolean -->
              <div class="toggle-field" *ngIf="isBool(key, 'revCorrection')">
                <mat-slide-toggle
                  [(ngModel)]="data.revCorrectionElements[key].value"
                  [name]="'revCorrection_' + key"
                  (change)="data.onRevCorrectionChange(key, data.revCorrectionElements[key].value)">
                  {{ getElementLabel(key, 'revCorrection') }}
                </mat-slide-toggle>
              </div>
            </ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
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

    mat-dialog-actions {
      padding: 16px 0 0 0;
      border-top: 1px solid #e0e0e0;
      margin-top: auto;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 20px 20px 10px 20px;
      background-color: #f5f5f5;
    }
  `]
})
export class ParametersDialogComponent {
  // Cache all computed values to prevent change detection loops
  parametersKeysCache: string[] = [];
  devicesKeysCache: string[] = [];
  opticKeysCache: string[] = [];
  guideParamsKeysCache: string[] = [];
  calParamsKeysCache: string[] = [];
  disCorrectionKeysCache: string[] = [];
  revCorrectionKeysCache: string[] = [];

  parametersLovsCache: { [key: string]: ListOfValue[] } = {};
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};
  opticLovsCache: { [key: string]: ListOfValue[] } = {};
  guideParamsLovsCache: { [key: string]: ListOfValue[] } = {};
  calParamsLovsCache: { [key: string]: ListOfValue[] } = {};
  disCorrectionLovsCache: { [key: string]: ListOfValue[] } = {};
  revCorrectionLovsCache: { [key: string]: ListOfValue[] } = {};

  // Original values for reset functionality
  private originalParametersValues: { [key: string]: any } = {};
  private originalDevicesValues: { [key: string]: any } = {};
  private originalOpticValues: { [key: string]: any } = {};
  private originalGuideParamsValues: { [key: string]: any } = {};
  private originalCalParamsValues: { [key: string]: any } = {};
  private originalDisCorrectionValues: { [key: string]: any } = {};
  private originalRevCorrectionValues: { [key: string]: any } = {};

  constructor(
    public dialogRef: MatDialogRef<ParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParametersDialogData
  ) {
    // Initialize all cached values in constructor
    this.initializeCaches();
  }

  private initializeCaches(): void {
    // Cache parameters keys and values
    if (this.data.parametersElements) {
      this.parametersKeysCache = Object.keys(this.data.parametersElements).sort((a, b) => {
        const orderA = this.data.parametersElements[a]?.order || '';
        const orderB = this.data.parametersElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each parameter element
      this.parametersKeysCache.forEach(key => {
        this.parametersLovsCache[key] = this.computeElementLovs(key, 'parameters');
        this.originalParametersValues[key] = this.data.parametersElements[key]?.value;
      });
    }

    // Cache devices keys and values
    if (this.data.devicesElements) {
      this.devicesKeysCache = Object.keys(this.data.devicesElements).sort((a, b) => {
        const orderA = this.data.devicesElements[a]?.order || '';
        const orderB = this.data.devicesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each device element
      this.devicesKeysCache.forEach(key => {
        this.devicesLovsCache[key] = this.computeElementLovs(key, 'devices');
        this.originalDevicesValues[key] = this.data.devicesElements[key]?.value;
      });
    }

    // Cache optic keys and values
    if (this.data.opticElements) {
      this.opticKeysCache = Object.keys(this.data.opticElements).sort((a, b) => {
        const orderA = this.data.opticElements[a]?.order || '';
        const orderB = this.data.opticElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each optic element
      this.opticKeysCache.forEach(key => {
        this.opticLovsCache[key] = this.computeElementLovs(key, 'optic');
        this.originalOpticValues[key] = this.data.opticElements[key]?.value;
      });
    }

    // Cache guide params keys and values
    if (this.data.guideParamsElements) {
      this.guideParamsKeysCache = Object.keys(this.data.guideParamsElements).sort((a, b) => {
        const orderA = this.data.guideParamsElements[a]?.order || '';
        const orderB = this.data.guideParamsElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each guide param element
      this.guideParamsKeysCache.forEach(key => {
        this.guideParamsLovsCache[key] = this.computeElementLovs(key, 'guideParams');
        this.originalGuideParamsValues[key] = this.data.guideParamsElements[key]?.value;
      });
    }

    // Cache calibration params keys and values
    if (this.data.calParamsElements) {
      this.calParamsKeysCache = Object.keys(this.data.calParamsElements).sort((a, b) => {
        const orderA = this.data.calParamsElements[a]?.order || '';
        const orderB = this.data.calParamsElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each cal param element
      this.calParamsKeysCache.forEach(key => {
        this.calParamsLovsCache[key] = this.computeElementLovs(key, 'calParams');
        this.originalCalParamsValues[key] = this.data.calParamsElements[key]?.value;
      });
    }

    // Cache disabled corrections keys and values
    if (this.data.disCorrectionElements) {
      this.disCorrectionKeysCache = Object.keys(this.data.disCorrectionElements).sort((a, b) => {
        const orderA = this.data.disCorrectionElements[a]?.order || '';
        const orderB = this.data.disCorrectionElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each disCorrection element
      this.disCorrectionKeysCache.forEach(key => {
        this.disCorrectionLovsCache[key] = this.computeElementLovs(key, 'disCorrection');
        this.originalDisCorrectionValues[key] = this.data.disCorrectionElements[key]?.value;
      });
    }

    // Cache reversed corrections keys and values
    if (this.data.revCorrectionElements) {
      this.revCorrectionKeysCache = Object.keys(this.data.revCorrectionElements).sort((a, b) => {
        const orderA = this.data.revCorrectionElements[a]?.order || '';
        const orderB = this.data.revCorrectionElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each revCorrection element
      this.revCorrectionKeysCache.forEach(key => {
        this.revCorrectionLovsCache[key] = this.computeElementLovs(key, 'revCorrection');
        this.originalRevCorrectionValues[key] = this.data.revCorrectionElements[key]?.value;
      });
    }
  }

  private computeElementLovs(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): ListOfValue[] {
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

  hasParameters(): boolean {
    return this.data.parametersElements && Object.keys(this.data.parametersElements).length > 0;
  }

  hasDevices(): boolean {
    return this.data.devicesElements && Object.keys(this.data.devicesElements).length > 0;
  }

  hasOptic(): boolean {
    return this.data.opticElements && Object.keys(this.data.opticElements).length > 0;
  }

  hasGuideParams(): boolean {
    return this.data.guideParamsElements && Object.keys(this.data.guideParamsElements).length > 0;
  }

  hasCalParams(): boolean {
    return this.data.calParamsElements && Object.keys(this.data.calParamsElements).length > 0;
  }

  hasDisCorrection(): boolean {
    return this.data.disCorrectionElements && Object.keys(this.data.disCorrectionElements).length > 0;
  }

  hasRevCorrection(): boolean {
    return this.data.revCorrectionElements && Object.keys(this.data.revCorrectionElements).length > 0;
  }

  getParametersKeys(): string[] {
    return this.parametersKeysCache;
  }

  getDevicesKeys(): string[] {
    return this.devicesKeysCache;
  }

  getOpticKeys(): string[] {
    return this.opticKeysCache;
  }

  getGuideParamsKeys(): string[] {
    return this.guideParamsKeysCache;
  }

  getCalParamsKeys(): string[] {
    return this.calParamsKeysCache;
  }

  getDisCorrectionKeys(): string[] {
    return this.disCorrectionKeysCache;
  }

  getRevCorrectionKeys(): string[] {
    return this.revCorrectionKeysCache;
  }

  getElement(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): Element | null {
    let elements: { [key: string]: Element };
    if (type === 'parameters') {
      elements = this.data.parametersElements;
    } else if (type === 'devices') {
      elements = this.data.devicesElements;
    } else if (type === 'optic') {
      elements = this.data.opticElements;
    } else if (type === 'guideParams') {
      elements = this.data.guideParamsElements;
    } else if (type === 'calParams') {
      elements = this.data.calParamsElements;
    } else if (type === 'disCorrection') {
      elements = this.data.disCorrectionElements;
    } else {
      elements = this.data.revCorrectionElements;
    }
    return elements?.[key] || null;
  }

  getElementLabel(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): string {
    const element = this.getElement(key, type);
    return element?.label || key;
  }

  isStringWithLov(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return hasLocalLov || hasGlobalLov;
  }

  isStringWithoutLov(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return !hasLocalLov && !hasGlobalLov;
  }

  isNumeric(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'int' || element?.type === 'float';
  }

  isBool(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'bool';
  }

  getElementLovs(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): ListOfValue[] {
    let cache: { [key: string]: ListOfValue[] };
    if (type === 'parameters') {
      cache = this.parametersLovsCache;
    } else if (type === 'devices') {
      cache = this.devicesLovsCache;
    } else if (type === 'optic') {
      cache = this.opticLovsCache;
    } else if (type === 'guideParams') {
      cache = this.guideParamsLovsCache;
    } else if (type === 'calParams') {
      cache = this.calParamsLovsCache;
    } else if (type === 'disCorrection') {
      cache = this.disCorrectionLovsCache;
    } else {
      cache = this.revCorrectionLovsCache;
    }
    return cache[key] || [];
  }

  /**
   * Reset all parameters to their original values
   */
  resetAllParameters(): void {
    this.parametersKeysCache.forEach(key => {
      this.data.parametersElements[key].value = this.originalParametersValues[key];
    });
  }

  /**
   * Reset all devices to their original values
   */
  resetAllDevices(): void {
    this.devicesKeysCache.forEach(key => {
      this.data.devicesElements[key].value = this.originalDevicesValues[key];
    });
  }

  /**
   * Reset all optic parameters to their original values
   */
  resetAllOptic(): void {
    this.opticKeysCache.forEach(key => {
      this.data.opticElements[key].value = this.originalOpticValues[key];
    });
  }

  /**
   * Reset all guide parameters to their original values
   */
  resetAllGuideParams(): void {
    this.guideParamsKeysCache.forEach(key => {
      this.data.guideParamsElements[key].value = this.originalGuideParamsValues[key];
    });
  }

  /**
   * Reset all calibration parameters to their original values
   */
  resetAllCalParams(): void {
    this.calParamsKeysCache.forEach(key => {
      this.data.calParamsElements[key].value = this.originalCalParamsValues[key];
    });
  }

  /**
   * Reset all disabled corrections to their original values
   */
  resetAllDisCorrection(): void {
    this.disCorrectionKeysCache.forEach(key => {
      this.data.disCorrectionElements[key].value = this.originalDisCorrectionValues[key];
    });
  }

  /**
   * Reset all reversed corrections to their original values
   */
  resetAllRevCorrection(): void {
    this.revCorrectionKeysCache.forEach(key => {
      this.data.revCorrectionElements[key].value = this.originalRevCorrectionValues[key];
    });
  }

  /**
   * Check if element has a description/help text
   */
  getElementDescription(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): string {
    const element = this.getElement(key, type);
    return (element as any)?.description || (element as any)?.hint || '';
  }

  /**
   * Check if element has min/max constraints
   */
  getElementConstraints(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): string {
    const element = this.getElement(key, type);
    if (!element) return '';

    const constraints: string[] = [];

    if ((element as any)?.min !== undefined) {
      constraints.push(`min: ${(element as any).min}`);
    }
    if ((element as any)?.max !== undefined) {
      constraints.push(`max: ${(element as any).max}`);
    }
    if ((element as any)?.step !== undefined) {
      constraints.push(`step: ${(element as any).step}`);
    }

    return constraints.length > 0 ? ` (${constraints.join(', ')})` : '';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
