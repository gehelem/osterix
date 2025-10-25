import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface GuidingData {
  grid: number[][];
  time?: number;
  RA?: number;
  DE?: number;
  RMS?: number;
  SNR?: number;
  pRA?: number;
  pDE?: number;
}

@Component({
  selector: 'app-guiding-graph',
  templateUrl: './guiding-graph.component.html',
  styleUrls: ['./guiding-graph.component.css']
})
export class GuidingGraphComponent implements OnChanges, AfterViewInit {
  @Input() guidingData: GuidingData | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    if (this.guidingData) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['guidingData'] && !changes['guidingData'].firstChange) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.guidingData || !this.chartCanvas) {
      return;
    }

    const chartData = this.prepareChartData();
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (context) => {
                return `Index: ${context[0].label}`;
              },
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${typeof value === 'number' ? value.toFixed(2) : value}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Temps (index)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          } as any,
          yDrive: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Dérive (arcsec)',
              font: {
                size: 12,
                weight: 'bold',
                color: '#666'
              }
            },
            grid: {
              color: 'rgba(100, 150, 200, 0.1)'
            },
            ticks: {
              color: '#666'
            }
          } as any,
          yPulse: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Pulse (ms)',
              font: {
                size: 12,
                weight: 'bold',
                color: '#666'
              }
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: '#666'
            }
          } as any,
          ySNR: {
            type: 'linear',
            display: true,
            position: 'right',
            offset: true,
            min: 0,
            title: {
              display: true,
              text: 'SNR',
              font: {
                size: 12,
                weight: 'bold',
                color: '#F44336'
              }
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: '#F44336'
            }
          } as any
        }
      }
    };

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, config);
    }
  }

  private updateChart(): void {
    if (this.chart && this.guidingData) {
      const chartData = this.prepareChartData();
      this.chart.data.labels = chartData.labels;
      this.chart.data.datasets = chartData.datasets;
      this.chart.update();
    }
  }

  private prepareChartData(): { labels: string[]; datasets: any[] } {
    if (!this.guidingData || !this.guidingData.grid || this.guidingData.grid.length === 0) {
      return { labels: [], datasets: [] };
    }

    const grid = this.guidingData.grid;
    // Extract time values from the last column (index 6) of each row
    // Convert from milliseconds to seconds and format as readable time
    const labels = grid.map((row) => {
      const timestamp = row[6]; // time is at index 6
      const date = new Date(timestamp);
      // Format: HH:MM:SS
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    });

    // Extract columns from grid
    // Grid structure: [DE, RA, RMS, SNR, pDE, pRA, time]
    const de = grid.map(row => row[0]); // Dérive DE
    const ra = grid.map(row => row[1]); // Dérive RA
    const rms = grid.map(row => row[2]); // RMS
    const snr = grid.map(row => row[3]); // SNR
    const pde = grid.map(row => row[4]); // Pulse DE
    const pra = grid.map(row => row[5]); // Pulse RA

    const datasets = [
      // RA - Green line
      {
        label: 'Dérive RA (AD)',
        data: ra,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        yAxisID: 'yDrive',
        pointRadius: 4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        borderDash: []
      },
      // DE - Blue line
      {
        label: 'Dérive DE',
        data: de,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        yAxisID: 'yDrive',
        pointRadius: 4,
        pointBackgroundColor: '#2196F3',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        borderDash: []
      },
      // pRA - Green bars
      {
        label: 'Pulse RA (AD)',
        data: pra,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderWidth: 1,
        yAxisID: 'yPulse',
        type: 'bar',
        borderRadius: 4,
        barThickness: 8
      },
      // pDE - Blue bars
      {
        label: 'Pulse DE',
        data: pde,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderWidth: 1,
        yAxisID: 'yPulse',
        type: 'bar',
        borderRadius: 4,
        barThickness: 8
      },
      // RMS - Yellow line (same axis as RA/DE)
      {
        label: 'RMS',
        data: rms,
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        yAxisID: 'yDrive',
        pointRadius: 4,
        pointBackgroundColor: '#FFC107',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        borderDash: []
      },
      // SNR - Red line
      {
        label: 'SNR (RSB)',
        data: snr,
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        yAxisID: 'ySNR',
        pointRadius: 4,
        pointBackgroundColor: '#F44336',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        borderDash: []
      }
    ];

    return { labels, datasets };
  }

  // Utility method to export chart data
  exportChartData(): void {
    if (this.chart) {
      console.log('Chart Data Export:', {
        data: this.chart.data,
        config: this.chart.config
      });
    }
  }
}
