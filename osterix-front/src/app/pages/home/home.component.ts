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
  private focusChart?: Chart;

  focusModule: Module | null = null;
  resultHFR: number | null = null;
  resultPos: number | null = null;

  private subscription = new Subscription();

  constructor(public wsService: WebsocketService) { }

  ngOnInit(): void {
    // Subscribe to state changes to get Focus module data
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Focus']) {
          this.focusModule = state.modules['Focus'];
          this.updateFromModule();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // If module data is already loaded, create the chart now
    if (this.focusModule) {
      setTimeout(() => {
        this.updateFocusChart();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.focusChart) {
      this.focusChart.destroy();
    }
  }

  private updateFromModule(): void {
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

}
