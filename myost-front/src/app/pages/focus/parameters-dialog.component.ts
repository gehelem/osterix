import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

  // Callbacks for direct changes
  onParameterChange: (name: string, value: any) => void;
  onParmsChange: (name: string, value: any) => void;
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
      <div class="params-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Paramètres de focus</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form class="focus-form">
              <mat-form-field appearance="fill">
                <mat-label>Itérations</mat-label>
                <input matInput type="number" [(ngModel)]="data.iterations" name="iterations"
                       (ngModelChange)="data.onParameterChange('iterations', $event)"
                       [disabled]="!data.parametersEnabled">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Position de démarrage</mat-label>
                <input matInput type="number" [(ngModel)]="data.startpos" name="startpos"
                       (ngModelChange)="data.onParameterChange('startpos', $event)"
                       [disabled]="!data.parametersEnabled">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Intervalle de pas</mat-label>
                <input matInput type="number" [(ngModel)]="data.steps" name="steps"
                       (ngModelChange)="data.onParameterChange('steps', $event)"
                       [disabled]="!data.parametersEnabled">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Backlash</mat-label>
                <input matInput type="number" [(ngModel)]="data.backlash" name="backlash"
                       (ngModelChange)="data.onParameterChange('backlash', $event)"
                       [disabled]="!data.parametersEnabled">
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle [(ngModel)]="data.aroundinitial" name="aroundinitial"
                                  (ngModelChange)="data.onParameterChange('aroundinitial', $event)"
                                  [disabled]="!data.parametersEnabled">
                  Autour de la position initiale
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="fill">
                <mat-label>Zoning</mat-label>
                <mat-select [(ngModel)]="data.zoning" name="zoning"
                            (ngModelChange)="data.onParameterChange('zoning', $event)"
                            [disabled]="!data.parametersEnabled">
                  <mat-option *ngFor="let option of data.zoningOptions" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Paramètres caméra</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form class="focus-form">
              <mat-form-field appearance="fill">
                <mat-label>Exposition (s)</mat-label>
                <input matInput type="number" [(ngModel)]="data.exposure" name="exposure" step="0.1"
                       (ngModelChange)="data.onParmsChange('exposure', $event)"
                       [disabled]="!data.parmsEnabled">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Gain</mat-label>
                <input matInput type="number" [(ngModel)]="data.gain" name="gain"
                       (ngModelChange)="data.onParmsChange('gain', $event)"
                       [disabled]="!data.parmsEnabled">
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Offset</mat-label>
                <input matInput type="number" [(ngModel)]="data.offset" name="offset"
                       (ngModelChange)="data.onParmsChange('offset', $event)"
                       [disabled]="!data.parmsEnabled">
              </mat-form-field>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </mat-dialog-content>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;
      padding: 16px 24px;
    }

    .close-button {
      margin-left: auto;
    }

    mat-dialog-content {
      min-width: 800px;
      max-width: 90vw;
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 24px 24px 24px;
    }

    .params-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    mat-card {
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
  `]
})
export class ParametersDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParametersDialogData
  ) {}
}
