import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SequenceRowData {
  count: number;
  exposure: number;
  filter: number;
  frametype: string;
  gain: number;
  offset: number;
  progress?: { dynlabel: string; value: number };
}

export interface SequenceRowDialogData {
  title: string;
  row: SequenceRowData;
  filterOptions: Map<number, string>;
  frameTypeOptions: Map<string, string>;
  isNewRow: boolean;
}

@Component({
  selector: 'app-sequence-row-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="dialog-field">
        <mat-label>Type d'image</mat-label>
        <mat-select [(ngModel)]="data.row.frametype">
          <mat-option *ngFor="let option of data.frameTypeOptions | keyvalue" [value]="option.key">
            {{ option.value }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill" class="dialog-field">
        <mat-label>Filtre</mat-label>
        <mat-select [(ngModel)]="data.row.filter" [compareWith]="compareNumbers">
          <mat-option *ngFor="let option of data.filterOptions | keyvalue" [value]="option.key">
            {{ option.value }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill" class="dialog-field">
        <mat-label>Exposition (s)</mat-label>
        <input matInput type="number" [(ngModel)]="data.row.exposure" min="0.00001" step="0.001">
      </mat-form-field>

      <mat-form-field appearance="fill" class="dialog-field">
        <mat-label>Nombre de poses</mat-label>
        <input matInput type="number" [(ngModel)]="data.row.count" min="1" step="1">
      </mat-form-field>

      <mat-form-field appearance="fill" class="dialog-field">
        <mat-label>Gain</mat-label>
        <input matInput type="number" [(ngModel)]="data.row.gain" min="0" step="1">
      </mat-form-field>

      <mat-form-field appearance="fill" class="dialog-field">
        <mat-label>Offset</mat-label>
        <input matInput type="number" [(ngModel)]="data.row.offset" min="0" step="1">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        {{ data.isNewRow ? 'Créer' : 'Mettre à jour' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-field {
      width: 100%;
      margin-bottom: 20px;
    }

    mat-dialog-content {
      padding: 20px;
      min-width: 400px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class SequenceRowDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SequenceRowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SequenceRowDialogData
  ) {}

  compareNumbers(n1: any, n2: any): boolean {
    return n1 === n2;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    this.dialogRef.close(this.data.row);
  }
}
