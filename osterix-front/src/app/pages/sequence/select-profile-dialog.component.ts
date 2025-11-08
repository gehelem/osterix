import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SelectProfileDialogData {
  profiles: { [key: string]: string };
}

@Component({
  selector: 'app-select-profile-dialog',
  template: `
    <h2 mat-dialog-title>Sélectionner un profil</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Profil</mat-label>
        <mat-select [(ngModel)]="selectedProfile">
          <mat-option *ngFor="let profile of profileNames" [value]="profile">
            {{ profile }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="load()" [disabled]="!selectedProfile">
        Charger
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
export class SelectProfileDialogComponent {
  selectedProfile: string = '';
  profileNames: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectProfileDialogData
  ) {
    this.profileNames = Object.keys(data.profiles);
    if (this.profileNames.length > 0) {
      this.selectedProfile = this.profileNames[0];
    }
  }

  load(): void {
    if (this.selectedProfile) {
      this.dialogRef.close({ profileName: this.selectedProfile });
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
