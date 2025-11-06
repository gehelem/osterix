import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sky-chart-dialog',
  templateUrl: './sky-chart-dialog.component.html',
  styleUrls: ['./sky-chart-dialog.component.css']
})
export class SkyChartDialogComponent {
  targetRA: number;
  targetDEC: number;
  fieldOfView: number = 10;

  constructor(
    public dialogRef: MatDialogRef<SkyChartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.targetRA = data?.targetRA || 0;
    this.targetDEC = data?.targetDEC || 0;
    this.fieldOfView = data?.fieldOfView || 10;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
