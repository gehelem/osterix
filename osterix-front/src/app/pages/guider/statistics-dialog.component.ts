import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageElement } from '../../models/ost.models';

@Component({
  selector: 'app-guider-statistics-dialog',
  template: `
    <h2 mat-dialog-title>
      Statistiques
      <button mat-icon-button mat-dialog-close class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content>
      <div class="stats-container" *ngIf="data">
        <mat-card>
          <mat-card-content>
            <div class="stat-row">
              <span class="stat-label">Largeur:</span>
              <span class="stat-value">{{ data.width }} px</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Hauteur:</span>
              <span class="stat-value">{{ data.height }} px</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Canaux:</span>
              <span class="stat-value">{{ data.channels }}</span>
            </div>
            <div class="stat-row" *ngIf="data.mean">
              <span class="stat-label">Moyenne:</span>
              <span class="stat-value">{{ formatValue(data.mean[0]) }}</span>
            </div>
            <div class="stat-row" *ngIf="data.median">
              <span class="stat-label">Médiane:</span>
              <span class="stat-value">{{ formatValue(data.median[0]) }}</span>
            </div>
            <div class="stat-row" *ngIf="data.stddev">
              <span class="stat-label">Écart-type:</span>
              <span class="stat-value">{{ formatValue(data.stddev[0]) }}</span>
            </div>
            <div class="stat-row" *ngIf="data.min">
              <span class="stat-label">Minimum:</span>
              <span class="stat-value">{{ formatValue(data.min[0]) }}</span>
            </div>
            <div class="stat-row" *ngIf="data.max">
              <span class="stat-label">Maximum:</span>
              <span class="stat-value">{{ formatValue(data.max[0]) }}</span>
            </div>
            <div class="stat-row" *ngIf="data.snr !== undefined">
              <span class="stat-label">SNR:</span>
              <span class="stat-value">{{ formatValue(data.snr) }}</span>
            </div>
            <div class="stat-row" *ngIf="data.stars !== undefined">
              <span class="stat-label">Étoiles détectées:</span>
              <span class="stat-value">{{ data.stars }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      <div *ngIf="!data" class="no-data">
        <p>Aucune donnée d'image disponible</p>
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
      padding: 24px;
      min-width: 400px;
    }

    .stats-container {
      width: 100%;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-weight: 500;
      color: #666;
    }

    .stat-value {
      font-weight: 600;
      color: #333;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  `]
})
export class GuiderStatisticsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GuiderStatisticsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageElement | null
  ) {
    console.log('Statistics dialog data:', data);
  }

  formatValue(value: number): string {
    return value.toFixed(2);
  }
}
