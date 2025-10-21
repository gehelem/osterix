import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element } from '../../models/ost.models';
import { Subscription } from 'rxjs';

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
export class FocusComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['date', 'filter', 'hfr', 'position'];
  focusModule: Module | null = null;
  focusHistory: FocusHistoryItem[] = [];

  // Parameters from backend - 'parameters' property
  iterations: number = 5;
  startpos: number = 32000;
  steps: number = 2000;
  backlash: number = 100;

  // Parameters from backend - 'parms' property
  exposure: number = 10;
  gain: number = 0;
  offset: number = 0;

  // Status
  isRunning: boolean = false;
  currentStatus: string = 'Idle';

  private subscription = new Subscription();

  constructor(public wsService: WebsocketService) { }

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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    }

    // Extract exposure/gain/offset from 'parms' property
    if (properties['parms']) {
      const parms = properties['parms'];
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

    // Extract status from 'actions' property
    if (properties['actions']) {
      const actions = properties['actions'];
      this.currentStatus = this.getStatusText(actions.status);
    }

    // Extract history from 'history' grid property (if exists)
    if (properties['history'] && properties['history'].grid) {
      this.focusHistory = this.parseHistory(properties['history']);
    }
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
      abort: true
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
}
