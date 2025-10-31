import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageElement } from '../../models/ost.models';

@Component({
  selector: 'app-statistics-dialog',
  template: `
    <h2 mat-dialog-title>Statistiques</h2>
    <mat-dialog-content>
      <div class="stats-container" *ngIf="data">
        <!-- Image dimensions -->
        <div class="stat-section">
          <div class="section-title">Dimensions</div>
          <div class="stat-row">
            <span class="stat-label">Largeur:</span>
            <span class="stat-value">{{ data.width || 'N/A' }} px</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Hauteur:</span>
            <span class="stat-value">{{ data.height || 'N/A' }} px</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Type:</span>
            <span class="stat-value">{{ getImageType() }}</span>
          </div>
        </div>

        <!-- Focus & Stars -->
        <div class="stat-section">
          <div class="section-title">Focus et étoiles</div>
          <div class="stat-row">
            <span class="stat-label">HFR moyen:</span>
            <span class="stat-value">{{ formatNumber(data.hfravg) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Nombre d'étoiles:</span>
            <span class="stat-value">{{ data.stars || 'N/A' }}</span>
          </div>
          <div class="stat-row" *ngIf="data.snr !== undefined">
            <span class="stat-label">SNR:</span>
            <span class="stat-value">{{ formatNumber(data.snr) }}</span>
          </div>
        </div>

        <!-- Statistics -->
        <div class="stat-section">
          <div class="section-title">Statistiques</div>
          <table class="stats-table">
            <thead>
              <tr>
                <th></th>
                <th *ngIf="data.channels === 3" class="r-header">R</th>
                <th *ngIf="data.channels === 3" class="g-header">G</th>
                <th *ngIf="data.channels === 3" class="b-header">B</th>
                <th *ngIf="data.channels === 1">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="stat-label">Minimum</td>
                <td *ngIf="data.channels === 3" class="r-value">{{ getValue(data.min, 0) }}</td>
                <td *ngIf="data.channels === 3" class="g-value">{{ getValue(data.min, 1) }}</td>
                <td *ngIf="data.channels === 3" class="b-value">{{ getValue(data.min, 2) }}</td>
                <td *ngIf="data.channels === 1" class="stat-value">{{ getValue(data.min, 0) }}</td>
              </tr>
              <tr>
                <td class="stat-label">Maximum</td>
                <td *ngIf="data.channels === 3" class="r-value">{{ getValue(data.max, 0) }}</td>
                <td *ngIf="data.channels === 3" class="g-value">{{ getValue(data.max, 1) }}</td>
                <td *ngIf="data.channels === 3" class="b-value">{{ getValue(data.max, 2) }}</td>
                <td *ngIf="data.channels === 1" class="stat-value">{{ getValue(data.max, 0) }}</td>
              </tr>
              <tr>
                <td class="stat-label">Moyenne</td>
                <td *ngIf="data.channels === 3" class="r-value">{{ getValue(data.mean, 0) }}</td>
                <td *ngIf="data.channels === 3" class="g-value">{{ getValue(data.mean, 1) }}</td>
                <td *ngIf="data.channels === 3" class="b-value">{{ getValue(data.mean, 2) }}</td>
                <td *ngIf="data.channels === 1" class="stat-value">{{ getValue(data.mean, 0) }}</td>
              </tr>
              <tr>
                <td class="stat-label">Médiane</td>
                <td *ngIf="data.channels === 3" class="r-value">{{ getValue(data.median, 0) }}</td>
                <td *ngIf="data.channels === 3" class="g-value">{{ getValue(data.median, 1) }}</td>
                <td *ngIf="data.channels === 3" class="b-value">{{ getValue(data.median, 2) }}</td>
                <td *ngIf="data.channels === 1" class="stat-value">{{ getValue(data.median, 0) }}</td>
              </tr>
              <tr>
                <td class="stat-label">Écart-type (σ)</td>
                <td *ngIf="data.channels === 3" class="r-value">{{ getValue(data.stddev, 0) }}</td>
                <td *ngIf="data.channels === 3" class="g-value">{{ getValue(data.stddev, 1) }}</td>
                <td *ngIf="data.channels === 3" class="b-value">{{ getValue(data.stddev, 2) }}</td>
                <td *ngIf="data.channels === 1" class="stat-value">{{ getValue(data.stddev, 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Plate solving info if available -->
        <div class="stat-section" *ngIf="data.issolved">
          <div class="section-title">Astrométrie</div>
          <div class="stat-row">
            <span class="stat-label">RA résolu:</span>
            <span class="stat-value">{{ formatNumber(data.solverra) }}°</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">DEC résolu:</span>
            <span class="stat-value">{{ formatNumber(data.solverde) }}°</span>
          </div>
        </div>
      </div>
      <div *ngIf="!data" class="no-data">
        Aucune donnée statistique disponible
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
      min-height: 400px;
      max-height: 600px;
      overflow-y: auto;
    }

    .stats-container {
      padding: 16px;
    }

    .stat-section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 500;
      color: #999;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 6px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-row.rgb-row {
      align-items: flex-start;
    }

    .stat-label {
      font-weight: 500;
      color: #666;
      flex-shrink: 0;
    }

    .stat-value {
      font-family: monospace;
      color: #333;
      font-weight: 600;
      text-align: right;
    }

    .stats-table {
      width: 100%;
      border-collapse: collapse;
      font-family: monospace;
    }

    .stats-table thead th {
      text-align: center;
      padding: 8px;
      font-weight: 600;
      font-size: 12px;
      border-bottom: 2px solid #e0e0e0;
    }

    .stats-table thead th:first-child {
      text-align: left;
    }

    .stats-table thead .r-header {
      color: #d32f2f;
    }

    .stats-table thead .g-header {
      color: #388e3c;
    }

    .stats-table thead .b-header {
      color: #1976d2;
    }

    .stats-table tbody tr {
      border-bottom: 1px solid #f5f5f5;
    }

    .stats-table tbody tr:last-child {
      border-bottom: none;
    }

    .stats-table tbody td {
      padding: 8px;
      text-align: center;
    }

    .stats-table tbody td:first-child {
      text-align: left;
      font-weight: 500;
      color: #666;
      font-family: inherit;
    }

    .stats-table .r-value {
      color: #d32f2f;
      font-weight: 600;
    }

    .stats-table .g-value {
      color: #388e3c;
      font-weight: 600;
    }

    .stats-table .b-value {
      color: #1976d2;
      font-weight: 600;
    }

    .stats-table .stat-value {
      color: #333;
      font-weight: 600;
    }

    .no-data {
      padding: 40px;
      text-align: center;
      color: #999;
      font-style: italic;
    }
  `]
})
export class StatisticsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StatisticsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageElement
  ) {}

  getImageType(): string {
    if (!this.data.channels) return 'N/A';
    return this.data.channels === 1 ? 'Noir et blanc' : `Couleur RGB`;
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(2);
  }

  getValue(value: number | number[] | undefined, index: number): string {
    if (value === undefined || value === null) return 'N/A';

    if (Array.isArray(value)) {
      if (index < value.length) {
        return value[index].toFixed(2);
      }
      return 'N/A';
    }

    // Si c'est une valeur unique (noir et blanc), retourner la valeur
    if (index === 0) {
      return value.toFixed(2);
    }

    return 'N/A';
  }
}
