import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element, ImageElement } from '../../models/ost.models';
import { Subscription } from 'rxjs';
import { HistogramDialogComponent } from './histogram-dialog.component';
import { StatisticsDialogComponent } from './statistics-dialog.component';
import { ParametersDialogComponent, ParametersDialogData } from './parameters-dialog.component';
import { Chart, ChartConfiguration } from 'chart.js';

interface FocusHistoryItem {
  date: string;
  filter: string;
  hfr: number;
  position: number;
}

@Component({
  selector: 'app-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.css']
})
export class FocusComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('focusChart') chartCanvasRef?: ElementRef<HTMLCanvasElement>;
  private focusChart?: Chart;

  displayedColumns: string[] = ['date', 'filter', 'hfr', 'position'];
  focusModule: Module | null = null;
  focusHistory: FocusHistoryItem[] = [];

  // Parameters from backend - 'parameters' property
  iterations: number = 5;
  startpos: number = 32000;
  steps: number = 2000;
  backlash: number = 100;
  aroundinitial: boolean = false;
  zoning: number = 0;
  zoningOptions: Array<{value: number, label: string}> = [];

  // Parameters from backend - 'parms' property
  exposure: number = 10;
  gain: number = 0;
  offset: number = 0;

  // Devices and optic properties
  devicesElements: { [key: string]: Element } = {};
  opticElements: { [key: string]: Element } = {};
  devicesEnabled: boolean = true;
  opticEnabled: boolean = true;

  // Image URL from backend
  imageUrl: string | null = null;

  // Fullscreen image
  fullscreenImageUrl: string | null = null;

  // Status
  isRunning: boolean = false;
  currentStatus: string = 'Idle';
  progressValue: number = 0;

  // Results
  resultHFR: number | null = null;
  resultPos: number | null = null;

  // Zones grid
  zonesGrid: string[][] = [];
  zonesHeaders: string[] = [];

  // Enabled states for properties
  parametersEnabled: boolean = true;
  parmsEnabled: boolean = true;

  private subscription = new Subscription();

  constructor(
    public wsService: WebsocketService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Subscribe to state changes to get Focus module data
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Focus']) {
          this.focusModule = state.modules['Focus'];
          console.log('Focus module loaded:', this.focusModule);
          this.updateFromModule();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // If module data is already loaded (e.g., when navigating back), create the chart now
    if (this.focusModule) {
      // Use setTimeout to ensure the view is fully initialized
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

  /**
   * Extract data from Focus module properties
   */
  private updateFromModule(): void {
    if (!this.focusModule) return;

    const properties = this.focusModule.properties;

    // Extract parameters from 'parameters' property
    if (properties['parameters']) {
      const params = properties['parameters'];
      // Extract enabled state
      this.parametersEnabled = params.enabled !== undefined ? params.enabled : true;

      if (params.elements['iterations']) {
        this.iterations = params.elements['iterations'].value;
      }
      if (params.elements['startpos']) {
        this.startpos = params.elements['startpos'].value;
      }
      if (params.elements['steps']) {
        this.steps = params.elements['steps'].value;
      }
      if (params.elements['backlash']) {
        this.backlash = params.elements['backlash'].value;
      }
      if (params.elements['aroundinitial']) {
        this.aroundinitial = params.elements['aroundinitial'].value;
      }
      if (params.elements['zoning']) {
        this.zoning = params.elements['zoning'].value;
        // Extract zoning options from listOfValues
        const zoningElement = params.elements['zoning'];
        if (zoningElement && (zoningElement as any).listOfValues) {
          const lovs = (zoningElement as any).listOfValues;
          // listOfValues can be an object {key: label} or an array [{value, label}]
          if (Array.isArray(lovs)) {
            this.zoningOptions = lovs.map((item: any) => ({
              value: item.value,
              label: item.label
            }));
          } else {
            // If it's an object, convert to array
            this.zoningOptions = Object.keys(lovs).map((key: string) => ({
              value: parseInt(key),
              label: lovs[key]
            }));
          }
        }
      }
    }

    // Extract exposure/gain/offset from 'parms' property
    if (properties['parms']) {
      const parms = properties['parms'];
      // Extract enabled state
      this.parmsEnabled = parms.enabled !== undefined ? parms.enabled : true;

      if (parms.elements['exposure']) {
        this.exposure = parms.elements['exposure'].value;
      }
      if (parms.elements['gain']) {
        this.gain = parms.elements['gain'].value;
      }
      if (parms.elements['offset']) {
        this.offset = parms.elements['offset'].value;
      }
    }

    // Extract devices property
    if (properties['devices']) {
      const devices = properties['devices'];
      this.devicesEnabled = devices.enabled !== undefined ? devices.enabled : true;
      this.devicesElements = devices.elements || {};
    }

    // Extract optic property
    if (properties['optic']) {
      const optic = properties['optic'];
      this.opticEnabled = optic.enabled !== undefined ? optic.enabled : true;
      this.opticElements = optic.elements || {};
    }

    // Extract status from 'actions' property
    if (properties['actions']) {
      const actions = properties['actions'];
      this.currentStatus = this.getStatusText(actions.status);
      this.isRunning = actions.status === 2; // 2 = Running
    }

    // Extract progress from 'progress' property
    if (properties['progress'] && properties['progress'].elements['global']) {
      this.progressValue = properties['progress'].elements['global'].value || 0;
    }

    // Extract results from 'results' property
    if (properties['results']) {
      const results = properties['results'];
      console.log('Results property:', results);
      console.log('Results elements:', results.elements);

      // Try both uppercase and lowercase HFR
      if (results.elements['HFR']) {
        this.resultHFR = parseFloat(results.elements['HFR'].value);
        console.log('HFR found (uppercase):', this.resultHFR);
      } else if (results.elements['hfr']) {
        this.resultHFR = parseFloat(results.elements['hfr'].value);
        console.log('HFR found (lowercase):', this.resultHFR);
      }

      if (results.elements['pos']) {
        this.resultPos = parseFloat(results.elements['pos'].value);
        console.log('Position found:', this.resultPos);
      }
    }

    // Extract zones grid from 'zones' property
    if (properties['zones']) {
      const zones = properties['zones'];
      if (zones.grid && zones.gridheaders) {
        this.zonesGrid = zones.grid;
        this.zonesHeaders = zones.gridheaders;
      }
    }

    // Extract image URL from 'image' property
    if (properties['image'] && properties['image'].elements['image']) {
      const imageElement = properties['image'].elements['image'] as ImageElement;
      if (imageElement.type === 'img' && imageElement.urljpeg) {
        // Build complete URL with protocol, host, port and /ostmedia/ folder
        const protocol = window.location.protocol; // 'http:' or 'https:'
        const hostname = window.location.hostname; // e.g., 'localhost'
        const port = 80; // Web server port
        // Add timestamp to force browser to reload the image (avoid cache)
        const timestamp = new Date().getTime();
        this.imageUrl = `${protocol}//${hostname}:${port}/ostmedia/${imageElement.urljpeg}?t=${timestamp}`;
        console.log('Image URL loaded:', this.imageUrl);
      }
    }

    // Extract history from 'history' grid property (if exists)
    if (properties['history'] && properties['history'].grid) {
      this.focusHistory = this.parseHistory(properties['history']);
    }

    // Update focus chart
    this.updateFocusChart();
  }

  /**
   * Parse history grid to FocusHistoryItem[]
   */
  private parseHistory(historyProperty: Property): FocusHistoryItem[] {
    if (!historyProperty.grid || !historyProperty.gridheaders) {
      return [];
    }

    return historyProperty.grid.map(row => {
      const headers = historyProperty.gridheaders!;
      return {
        date: row[headers.indexOf('date')] || '',
        filter: row[headers.indexOf('filter')] || '',
        hfr: parseFloat(row[headers.indexOf('hfr')]) || 0,
        position: parseInt(row[headers.indexOf('position')]) || 0
      };
    });
  }

  /**
   * Get status text from status code
   */
  private getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Idle';
      case 1: return 'Ok';
      case 2: return 'Running...';
      case 3: return 'Error';
      default: return 'Unknown';
    }
  }

  /**
   * Start focus run
   */
  startFocus(): void {
    console.log('Starting focus');

    // Trigger autofocus (parameters are already updated via onParameterChange)
    this.wsService.setProperty('Focus', 'actions', {
      autofocus: true
    });
  }

  /**
   * Update a parameter value (for directedit=true fields)
   */
  onParameterChange(elementName: string, value: any): void {
    console.log(`Updating parameter ${elementName} to ${value}`);
    this.wsService.setProperty('Focus', 'parameters', {
      [elementName]: value
    });
  }

  /**
   * Update a parms value (for directedit=true fields)
   */
  onParmsChange(elementName: string, value: any): void {
    console.log(`Updating parms ${elementName} to ${value}`);
    this.wsService.setProperty('Focus', 'parms', {
      [elementName]: value
    });
  }

  /**
   * Stop focus run
   */
  stopFocus(): void {
    console.log('Stopping focus');
    this.wsService.setProperty('Focus', 'actions', {
      abortfocus: true
    });
  }

  /**
   * Get property value safely
   */
  getPropertyElement(propertyName: string, elementName: string): any {
    if (!this.focusModule || !this.focusModule.properties[propertyName]) {
      return null;
    }
    return this.focusModule.properties[propertyName].elements[elementName];
  }

  /**
   * Check if module is loaded
   */
  get isModuleLoaded(): boolean {
    return this.focusModule !== null;
  }

  /**
   * Update a devices value
   */
  onDevicesChange(elementName: string, value: any): void {
    console.log(`Updating devices ${elementName} to ${value}`);
    this.wsService.setProperty('Focus', 'devices', {
      [elementName]: value
    });
  }

  /**
   * Update an optic value
   */
  onOpticChange(elementName: string, value: any): void {
    console.log(`Updating optic ${elementName} to ${value}`);
    this.wsService.setProperty('Focus', 'optic', {
      [elementName]: value
    });
  }

  /**
   * Open parameters dialog
   */
  openParametersDialog(): void {
    const dialogData: ParametersDialogData = {
      iterations: this.iterations,
      startpos: this.startpos,
      steps: this.steps,
      backlash: this.backlash,
      aroundinitial: this.aroundinitial,
      zoning: this.zoning,
      zoningOptions: this.zoningOptions,
      parametersEnabled: this.parametersEnabled,
      exposure: this.exposure,
      gain: this.gain,
      offset: this.offset,
      parmsEnabled: this.parmsEnabled,
      devicesElements: this.devicesElements,
      devicesEnabled: this.devicesEnabled,
      opticElements: this.opticElements,
      opticEnabled: this.opticEnabled,
      globallovs: this.focusModule?.globallovs || {},
      onParameterChange: (name: string, value: any) => this.onParameterChange(name, value),
      onParmsChange: (name: string, value: any) => this.onParmsChange(name, value),
      onDevicesChange: (name: string, value: any) => this.onDevicesChange(name, value),
      onOpticChange: (name: string, value: any) => this.onOpticChange(name, value)
    };

    this.dialog.open(ParametersDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: dialogData
    });
  }

  /**
   * Open image in fullscreen
   */
  openImageFullscreen(): void {
    if (this.imageUrl) {
      this.fullscreenImageUrl = this.imageUrl;
    }
  }

  /**
   * Close fullscreen image
   */
  closeFullscreen(): void {
    this.fullscreenImageUrl = null;
  }

  /**
   * Get current image element
   */
  private getCurrentImageElement(): ImageElement | null {
    if (!this.focusModule || !this.focusModule.properties['image']) {
      return null;
    }
    const imageElement = this.focusModule.properties['image'].elements['image'];
    if (imageElement && imageElement.type === 'img') {
      return imageElement as ImageElement;
    }
    return null;
  }

  /**
   * Get zone header label (rename "bestpos" to "position")
   */
  getZoneHeaderLabel(header: string): string {
    if (header === 'bestpos') {
      return 'position';
    }
    return header;
  }

  /**
   * Format zone value (truncate numeric values)
   */
  formatZoneValue(value: string, columnIndex: number): string {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Format numeric values with French locale (0 decimals, thousands separator)
      return numValue.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return value;
  }

  /**
   * Show histogram dialog
   */
  showHistogram(event: Event): void {
    event.stopPropagation(); // Prevent triggering fullscreen
    const imageData = this.getCurrentImageElement();
    this.dialog.open(HistogramDialogComponent, {
      width: '800px',
      height: '600px',
      data: imageData
    });
  }

  /**
   * Show statistics dialog
   */
  showStatistics(event: Event): void {
    event.stopPropagation(); // Prevent triggering fullscreen
    const imageData = this.getCurrentImageElement();
    this.dialog.open(StatisticsDialogComponent, {
      width: '600px',
      height: '600px',
      data: imageData
    });
  }

  /**
   * Update focus chart with data from 'values' property grid
   */
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
          pointRadius: 4,
          pointHoverRadius: 6,
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
              display: true,
              text: 'Position Focuser'
            }
          },
          y: {
            title: {
              display: true,
              text: 'HFR'
            },
            beginAtZero: false
          }
        }
      }
    };

    this.focusChart = new Chart(this.chartCanvasRef.nativeElement, config);
  }

}
