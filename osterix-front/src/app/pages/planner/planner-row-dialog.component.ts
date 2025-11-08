import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PlannerRowData {
  object: string;
  ra: number;
  dec: number;
  profile: string;
}

export interface PlannerRowDialogData {
  title: string;
  row: PlannerRowData;
  profiles: { [key: string]: string };
  isNewRow: boolean;
}

@Component({
  selector: 'app-planner-row-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field appearance="fill" class="dialog-field">
          <mat-label>Nom de l'objet</mat-label>
          <input
            matInput
            [(ngModel)]="data.row.object"
            name="object"
            required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="dialog-field">
          <mat-label>AD (Right Ascension)</mat-label>
          <input
            matInput
            type="number"
            [(ngModel)]="data.row.ra"
            name="ra"
            step="0.01"
            required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="dialog-field">
          <mat-label>DEC (Déclinaison)</mat-label>
          <input
            matInput
            type="number"
            [(ngModel)]="data.row.dec"
            name="dec"
            step="0.01"
            required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="dialog-field">
          <mat-label>Profil</mat-label>
          <input
            matInput
            [(ngModel)]="data.row.profile"
            name="profile"
            required>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        Annuler
      </button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data.row" [disabled]="!isValid()">
        {{ data.isNewRow ? 'Ajouter' : 'Mettre à jour' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      margin: 0;
      padding: 20px 20px 10px 20px;
      background-color: var(--table-header-bg, #f5f5f5);
      color: var(--table-header-text, #333);
    }

    mat-dialog-content {
      padding: 20px;
      background-color: var(--content-bg, #f5f5f5);
      color: var(--primary-text, #333);
      min-width: 400px;
    }

    .dialog-field {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-actions {
      padding: 12px 0 0 0;
      margin-top: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class PlannerRowDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PlannerRowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlannerRowDialogData
  ) {}

  isValid(): boolean {
    return !!(
      this.data.row.object &&
      this.data.row.object.trim() &&
      this.data.row.ra !== undefined &&
      this.data.row.dec !== undefined &&
      this.data.row.profile &&
      this.data.row.profile.trim()
    );
  }
}
