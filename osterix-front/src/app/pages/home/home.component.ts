import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property } from '../../models/ost.models';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('focusChart') chartCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('guiderChart') guiderChartRef?: ElementRef<HTMLCanvasElement>;
  private focusChart?: Chart;
  private guiderChart?: Chart;

  focusModule: Module | null = null;
  resultHFR: number | null = null;
  resultPos: number | null = null;

  sequenceModule: Module | null = null;
  sequenceStatus: string = 'Idle';
  sequenceGlobalProgress: number = 0;
  sequenceExposureProgress: number = 0;

  guiderModule: Module | null = null;
  rmsRA: number | null = null;
  rmsDEC: number | null = null;
  rmsTotal: number | null = null;
  guidingData: any[] = [];

  plannerModule: Module | null = null;
  plannerObjectCount: number = 0;

  private subscription = new Subscription();

  constructor(public wsService: WebsocketService) { }

  ngOnInit(): void {
    // Initialize sequence values
    this.sequenceStatus = 'Idle';
    this.sequenceGlobalProgress = 0;
    this.sequenceExposureProgress = 0;

    // Subscribe to state changes to get Focus, Sequence, Guider and Planner module data
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Focus']) {
          this.focusModule = state.modules['Focus'];
          this.updateFromFocusModule();
        }
        if (state.modules['Sequencer']) {
          this.sequenceModule = state.modules['Sequencer'];
          this.updateFromSequenceModule();
        }
        if (state.modules['Guider']) {
          this.guiderModule = state.modules['Guider'];
          this.updateFromGuiderModule();
        }
        if (state.modules['Planner']) {
          this.plannerModule = state.modules['Planner'];
          this.updateFromPlannerModule();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // If module data is already loaded, create the charts now
    if (this.focusModule) {
      setTimeout(() => {
        this.updateFocusChart();
      }, 0);
    }
    if (this.guiderModule && this.guidingData.length > 0) {
      setTimeout(() => {
        this.updateGuiderChart();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.focusChart) {
      this.focusChart.destroy();
    }
    if (this.guiderChart) {
      this.guiderChart.destroy();
    }
  }

  private updateFromFocusModule(): void {
    if (!this.focusModule) return;

    const properties = this.focusModule.properties;

    // Extract results from 'results' property
    if (properties['results']) {
      const results = properties['results'];

      // Try both uppercase and lowercase HFR
      if (results.elements['HFR']) {
        this.resultHFR = parseFloat(results.elements['HFR'].value);
      } else if (results.elements['hfr']) {
        this.resultHFR = parseFloat(results.elements['hfr'].value);
      }

      if (results.elements['pos']) {
        this.resultPos = parseFloat(results.elements['pos'].value);
      }
    }

    // Update focus chart
    this.updateFocusChart();
  }

  private updateFromSequenceModule(): void {
    if (!this.sequenceModule) {
      this.sequenceStatus = 'Module non chargé';
      return;
    }

    const properties = this.sequenceModule.properties;

    // Extract status from 'actions' property
    if (properties && properties['actions']) {
      const actions = properties['actions'];
      if (actions.elements && actions.elements['status']) {
        const statusValue = actions.elements['status'].value;
        this.sequenceStatus = this.getSequenceStatusText(statusValue);
      }
    }

    // Extract progress from 'progress' property
    if (properties && properties['progress']) {
      const progress = properties['progress'];
      if (progress.elements) {
        if (progress.elements['global']) {
          const val = parseFloat(progress.elements['global'].value);
          this.sequenceGlobalProgress = isNaN(val) ? 0 : val;
        }
        if (progress.elements['exposure']) {
          const val = parseFloat(progress.elements['exposure'].value);
          this.sequenceExposureProgress = isNaN(val) ? 0 : val;
        }
      }
    }

    console.log('Sequence module updated:', {
      status: this.sequenceStatus,
      global: this.sequenceGlobalProgress,
      exposure: this.sequenceExposureProgress
    });
  }

  private getSequenceStatusText(status: number): string {
    switch (status) {
      case 0: return 'Idle';
      case 1: return 'Paused';
      case 2: return 'Running';
      case 3: return 'Completed';
      default: return 'Unknown';
    }
  }

  private updateFromGuiderModule(): void {
    if (!this.guiderModule) return;

    const properties = this.guiderModule.properties;

    // Extract RMS values from 'values' property
    if (properties['values']) {
      const values = properties['values'];

      // Look for RMS RA (also try rmsRA, RMS_RA variations)
      if (values.elements['RMS RA']) {
        this.rmsRA = parseFloat(values.elements['RMS RA'].value);
      } else if (values.elements['rmsRA']) {
        this.rmsRA = parseFloat(values.elements['rmsRA'].value);
      } else if (values.elements['RMS_RA']) {
        this.rmsRA = parseFloat(values.elements['RMS_RA'].value);
      }

      // Look for RMS DEC (also try rmsDEC, RMS_DEC variations)
      if (values.elements['RMS DEC']) {
        this.rmsDEC = parseFloat(values.elements['RMS DEC'].value);
      } else if (values.elements['rmsDEC']) {
        this.rmsDEC = parseFloat(values.elements['rmsDEC'].value);
      } else if (values.elements['RMS_DEC']) {
        this.rmsDEC = parseFloat(values.elements['RMS_DEC'].value);
      }

      // Look for RMS Total (also try rmsTotal, RMS_Total variations)
      if (values.elements['RMS Total']) {
        this.rmsTotal = parseFloat(values.elements['RMS Total'].value);
      } else if (values.elements['rmsTotal']) {
        this.rmsTotal = parseFloat(values.elements['rmsTotal'].value);
      } else if (values.elements['RMS_Total']) {
        this.rmsTotal = parseFloat(values.elements['RMS_Total'].value);
      }
    }

    // Extract guiding data from 'guiding' property
    if (properties['guiding']) {
      const guidingProperty = properties['guiding'];
      if ((guidingProperty as any).grid) {
        // Keep only last 20 points for the mini chart
        const grid = (guidingProperty as any).grid;
        this.guidingData = grid.slice(Math.max(0, grid.length - 20));
        // Update the chart
        this.updateGuiderChart();
      }
    }
  }

  private updateFocusChart(): void {
    if (!this.chartCanvasRef || !this.focusModule) {
      return;
    }

    const properties = this.focusModule.properties;
    if (!properties['values'] || !properties['values'].grid || !properties['values'].gridheaders) {
      return;
    }

    const grid = properties['values'].grid;
    const headers = properties['values'].gridheaders;

    // Find column indices
    const focposIndex = headers.indexOf('focpos');
    const hfrIndex = headers.indexOf('loopHFRavg');

    if (focposIndex === -1 || hfrIndex === -1) {
      return;
    }

    // Extract data points
    const dataPoints: Array<{x: number, y: number}> = [];
    for (const row of grid) {
      const focpos = parseFloat(row[focposIndex]);
      const hfr = parseFloat(row[hfrIndex]);
      if (!isNaN(focpos) && !isNaN(hfr)) {
        dataPoints.push({ x: focpos, y: hfr });
      }
    }

    // Sort by focpos for proper line connection
    dataPoints.sort((a, b) => a.x - b.x);

    // Destroy existing chart if any
    if (this.focusChart) {
      this.focusChart.destroy();
    }

    // Create new chart
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        datasets: [{
          label: 'HFR',
          data: dataPoints,
          borderColor: 'rgba(76, 175, 80, 1)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: false
            }
          },
          y: {
            title: {
              display: false
            },
            beginAtZero: false
          }
        }
      }
    };

    this.focusChart = new Chart(this.chartCanvasRef.nativeElement, config);
  }

  private updateGuiderChart(): void {
    if (!this.guiderChartRef || this.guidingData.length === 0) {
      return;
    }

    // Grid structure: [DE, RA, RMS, SNR, pDE, pRA, time]
    const de = this.guidingData.map(row => row[0]); // Dérive DE
    const ra = this.guidingData.map(row => row[1]); // Dérive RA
    const rms = this.guidingData.map(row => row[2]); // RMS
    const labels = this.guidingData.map((_, index) => index.toString());

    // Destroy existing chart if any
    if (this.guiderChart) {
      this.guiderChart.destroy();
    }

    // Create new chart with only RA and DE drifts
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          // RA - Green line
          {
            label: 'Dérive RA (AD)',
            data: ra,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            tension: 0,
            pointRadius: 2,
            pointBackgroundColor: '#4CAF50',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            fill: false
          },
          // DE - Blue line
          {
            label: 'Dérive DE',
            data: de,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            tension: 0,
            pointRadius: 2,
            pointBackgroundColor: '#2196F3',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            fill: false
          },
          // RMS - Yellow line
          {
            label: 'RMS',
            data: rms,
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 2,
            tension: 0,
            pointRadius: 2,
            pointBackgroundColor: '#FFC107',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 10,
              font: {
                size: 10
              }
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            display: false,
            title: {
              display: false
            }
          },
          y: {
            title: {
              display: false
            },
            beginAtZero: false
          }
        }
      }
    };

    const ctx = this.guiderChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.guiderChart = new Chart(ctx, config);
    }
  }

  private updateFromPlannerModule(): void {
    if (!this.plannerModule) return;

    const properties = this.plannerModule.properties;

    // Count objects in planning grid
    if (properties['planning'] && properties['planning'].grid) {
      this.plannerObjectCount = properties['planning'].grid.length;
    } else {
      this.plannerObjectCount = 0;
    }
  }

}
