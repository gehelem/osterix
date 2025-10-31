import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageElement } from '../../models/ost.models';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-histogram-dialog',
  template: `
    <h2 mat-dialog-title>Histogramme</h2>
    <mat-dialog-content>
      <div class="histogram-container" *ngIf="data && data.histogram">
        <canvas #histogramCanvas></canvas>
      </div>
      <div *ngIf="!data || !data.histogram" class="no-data">
        <mat-icon>show_chart</mat-icon>
        <p>Aucune donnée d'histogramme disponible</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 700px;
      min-height: 450px;
      max-height: 600px;
      overflow-y: auto;
    }

    .histogram-container {
      padding: 16px;
    }

    canvas {
      width: 100% !important;
      height: 400px !important;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-data p {
      margin: 0;
      font-size: 16px;
      font-style: italic;
    }
  `]
})
export class HistogramDialogComponent implements AfterViewInit {
  @ViewChild('histogramCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(
    public dialogRef: MatDialogRef<HistogramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageElement
  ) {}

  ngAfterViewInit(): void {
    if (this.data && this.data.histogram && this.canvasRef) {
      this.createHistogram();
    }
  }

  private createHistogram(): void {
    const histogram = this.data.histogram!;
    const channels = this.data.channels || 1;

    // histogram is an array of channel histograms
    // For grayscale: histogram = [[bin0, bin1, ..., bin63]]
    // For RGB: histogram = [[binR0, binR1, ...], [binG0, binG1, ...], [binB0, binB1, ...]]

    // Get the first channel histogram to determine number of bins
    const firstChannelData = histogram[0];
    const numBins = firstChannelData.length;

    // Prepare labels (bin indices)
    const labels = Array.from({ length: numBins }, (_, i) => i.toString());

    let datasets: any[] = [];

    if (channels === 1) {
      // Grayscale - single histogram
      // Extract values from each bin (histogram[0][i] is [value])
      const data = firstChannelData.map(bin => Array.isArray(bin) ? bin[0] : bin);

      datasets = [{
        label: 'Intensité',
        data: data,
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
        borderColor: 'rgba(128, 128, 128, 1)',
        borderWidth: 1,
        fill: true
      }];
    } else if (channels === 3) {
      // RGB - three histograms
      // Extract R, G, B values from each bin
      const redData = histogram[0].map(bin => Array.isArray(bin) ? bin[0] : bin);
      const greenData = histogram[1].map(bin => Array.isArray(bin) ? bin[0] : bin);
      const blueData = histogram[2].map(bin => Array.isArray(bin) ? bin[0] : bin);

      datasets = [
        {
          label: 'Rouge',
          data: redData,
          backgroundColor: 'rgba(244, 67, 54, 0.3)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1,
          fill: true
        },
        {
          label: 'Vert',
          data: greenData,
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1,
          fill: true
        },
        {
          label: 'Bleu',
          data: blueData,
          backgroundColor: 'rgba(33, 150, 243, 0.3)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 1,
          fill: true
        }
      ];
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: channels === 3,
            position: 'top'
          }
        },
        scales: {
          x: {
            display: true,
            ticks: {
              maxTicksLimit: 16
            }
          },
          y: {
            display: true,
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
