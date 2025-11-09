import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SaveProfileDialogData {
  profileName: string;
  title?: string;
  inputLabel?: string;
}

@Component({
  selector: 'app-save-profile-dialog',
  template: `
    <h2 mat-dialog-title>{{ dialogTitle }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>{{ inputLabel }}</mat-label>
        <input
          matInput
          [(ngModel)]="profileName"
          (keyup.enter)="save()"
          autofocus>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!profileName.trim()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px;
      margin: 0;
    }
  `]
})
export class SaveProfileDialogComponent {
  profileName: string = '';
  dialogTitle: string = 'Enregistrer le profil';
  inputLabel: string = 'Nom du profil';

  constructor(
    public dialogRef: MatDialogRef<SaveProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaveProfileDialogData
  ) {
    this.profileName = data.profileName || '';
    this.dialogTitle = data.title || 'Enregistrer le profil';
    this.inputLabel = data.inputLabel || 'Nom du profil';
  }

  save(): void {
    if (this.profileName.trim()) {
      this.dialogRef.close({ profileName: this.profileName.trim() });
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
