import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageElement } from '../../models/ost.models';

@Component({
  selector: 'app-guider-histogram-dialog',
  template: `
    <h2 mat-dialog-title>
      Histogramme
      <button mat-icon-button mat-dialog-close class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content>
      <div class="histogram-container">
        <canvas #histogramCanvas></canvas>
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
      min-height: 400px;
    }

    .histogram-container {
      width: 100%;
      height: 500px;
    }
  `]
})
export class GuiderHistogramDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GuiderHistogramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageElement | null
  ) {
    console.log('Histogram dialog data:', data);
  }
}
