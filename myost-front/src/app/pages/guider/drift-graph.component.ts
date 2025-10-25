import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface DriftData {
  grid: number[][];
  graphParams?: {
    X: string;
    Y: string;
    Xmin: number;
    Xmax: number;
    Ymin: number;
    Ymax: number;
  };
}

@Component({
  selector: 'app-drift-graph',
  templateUrl: './drift-graph.component.html',
  styleUrls: ['./drift-graph.component.css']
})
export class DriftGraphComponent implements OnChanges, AfterViewInit {
  @Input() driftData: DriftData | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    if (this.driftData) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['driftData'] && !changes['driftData'].firstChange) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.driftData || !this.chartCanvas) {
      return;
    }

    const chartData = this.prepareChartData();
    const graphParams = this.driftData.graphParams;

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: chartData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        devicePixelRatio: 1,
        animation: false as any,
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                return `RA: ${(context.parsed.x as number).toFixed(2)}, DEC: ${(context.parsed.y as number).toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'RA (AD)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              font: {
                size: 12
              }
            },
            min: graphParams?.Xmin || -5,
            max: graphParams?.Xmax || 5,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          } as any,
          y: {
            title: {
              display: true,
              text: 'DEC',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              font: {
                size: 12
              }
            },
            min: graphParams?.Ymin || -5,
            max: graphParams?.Ymax || 5,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
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
    if (this.chart && this.driftData) {
      const chartData = this.prepareChartData();
      this.chart.data.datasets = chartData.datasets;
      this.chart.update();
    }
  }

  private prepareChartData(): { datasets: any[] } {
    if (!this.driftData || !this.driftData.grid || this.driftData.grid.length === 0) {
      return { datasets: [] };
    }

    const grid = this.driftData.grid;
    const points = grid.map(row => ({
      x: row[0],  // RA
      y: row[1]   // DEC
    }));

    const datasets = [
      {
        label: 'Drift (RA vs DEC)',
        data: points,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        pointRadius: 5,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        showLine: false
      }
    ];

    return { datasets };
  }
}
