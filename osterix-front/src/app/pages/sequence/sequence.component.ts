import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element } from '../../models/ost.models';
import { Subscription } from 'rxjs';

interface SequenceRow {
  count: number;
  exposure: number;
  filter: number;
  frametype: string;
  gain: number;
  offset: number;
  progress: { dynlabel: string; value: number };
}

@Component({
  selector: 'app-sequence',
  templateUrl: './sequence.component.html',
  styleUrls: ['./sequence.component.css']
})
export class SequenceComponent implements OnInit, OnDestroy {
  // Module data
  sequencerModule: Module | null = null;

  // Display columns for the sequence grid
  displayedColumns: string[] = ['frametype', 'filter', 'exposure', 'count', 'gain', 'offset', 'progress'];

  // Sequence grid data
  sequenceRows: SequenceRow[] = [];

  // Object target properties
  objectName: string = '';
  objectRA: number = 0;
  objectDEC: number = 0;

  // Devices
  devicesElements: { [key: string]: Element } = {};
  devicesEnabled: boolean = true;

  // Optics
  opticElements: { [key: string]: Element } = {};
  opticEnabled: boolean = true;

  // Parameters (advanced options)
  autoFocusAtStart: boolean = true;
  autoFocusOnFilterChange: boolean = true;
  focusModule: string = 'Focus';
  suspendGuidingDuringFocus: boolean = true;
  guiderModule: string = 'Guider';
  guidingSettleTime: number = 10;

  // Camera exposure/gain/offset
  exposure: number = 0;
  gain: number = 0;
  offset: number = 0;

  // Progress
  globalProgress: number = 0;
  exposureProgress: number = 0;

  // Status
  isRunning: boolean = false;
  currentStatus: string = 'Idle';

  // Filter options and lists
  filterOptions: Map<number, string> = new Map();
  frameTypeOptions: Map<string, string> = new Map();

  // Enabled states
  parametersEnabled: boolean = true;
  parmsEnabled: boolean = true;

  private subscription = new Subscription();

  constructor(
    public wsService: WebsocketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes to get Sequencer module data
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Sequencer']) {
          this.sequencerModule = state.modules['Sequencer'];
          console.log('Sequencer module loaded:', this.sequencerModule);
          this.updateFromModule();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Extract data from Sequencer module properties
   */
  private updateFromModule(): void {
    if (!this.sequencerModule) return;

    const properties = this.sequencerModule.properties;

    // Extract object target properties
    if (properties['object']) {
      const object = properties['object'];
      if (object.elements['label']) {
        this.objectName = object.elements['label'].value;
      }
      if (object.elements['ra']) {
        this.objectRA = object.elements['ra'].value;
      }
      if (object.elements['de']) {
        this.objectDEC = object.elements['de'].value;
      }
    }

    // Extract devices
    if (properties['devices']) {
      const devices = properties['devices'];
      this.devicesEnabled = devices.enabled !== undefined ? devices.enabled : true;
      this.devicesElements = devices.elements || {};
    }

    // Extract optics
    if (properties['optic']) {
      const optic = properties['optic'];
      this.opticEnabled = optic.enabled !== undefined ? optic.enabled : true;
      this.opticElements = optic.elements || {};
    }

    // Extract parameters (advanced options)
    if (properties['parameters']) {
      const params = properties['parameters'];
      this.parametersEnabled = params.enabled !== undefined ? params.enabled : true;

      if (params.elements['autofocusatstart']) {
        this.autoFocusAtStart = params.elements['autofocusatstart'].value;
      }
      if (params.elements['autofocusonfilterchange']) {
        this.autoFocusOnFilterChange = params.elements['autofocusonfilterchange'].value;
      }
      if (params.elements['focusmodule']) {
        this.focusModule = params.elements['focusmodule'].value;
      }
      if (params.elements['suspendguidingduringfocus']) {
        this.suspendGuidingDuringFocus = params.elements['suspendguidingduringfocus'].value;
      }
      if (params.elements['guidermodule']) {
        this.guiderModule = params.elements['guidermodule'].value;
      }
      if (params.elements['guidingsettletime']) {
        this.guidingSettleTime = params.elements['guidingsettletime'].value;
      }
    }

    // Extract exposure/gain/offset from 'parms' property
    if (properties['parms']) {
      const parms = properties['parms'];
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

    // Extract status from 'actions' property
    if (properties['actions']) {
      const actions = properties['actions'];
      this.currentStatus = this.getStatusText(actions.status);
      this.isRunning = actions.status === 2; // 2 = Running
    }

    // Extract progress
    if (properties['progress']) {
      const progress = properties['progress'];
      if (progress.elements['global']) {
        this.globalProgress = progress.elements['global'].value || 0;
      }
      if (progress.elements['exposure']) {
        this.exposureProgress = progress.elements['exposure'].value || 0;
      }
    }

    // Extract sequence grid
    if (properties['sequence']) {
      const sequence = properties['sequence'];

      // Parse filter options
      if (sequence.elements['filter'] && (sequence.elements['filter'] as any).listOfValues) {
        const lovs = (sequence.elements['filter'] as any).listOfValues;
        this.filterOptions = new Map(Object.entries(lovs).map(([k, v]: [string, any]) => [parseInt(k), v]));
      }

      // Parse frame type options
      if (sequence.elements['frametype'] && (sequence.elements['frametype'] as any).listOfValues) {
        const lovs = (sequence.elements['frametype'] as any).listOfValues;
        this.frameTypeOptions = new Map(Object.entries(lovs).map(([k, v]: [string, any]) => [k, v]));
      }

      // Parse grid data
      if (sequence.grid && sequence.gridheaders) {
        this.sequenceRows = this.parseSequenceGrid(sequence);
      }
    }
  }

  /**
   * Parse sequence grid data
   */
  private parseSequenceGrid(sequence: Property): SequenceRow[] {
    if (!sequence.grid || !sequence.gridheaders) {
      return [];
    }

    const headers = sequence.gridheaders;
    const countIdx = headers.indexOf('count');
    const exposureIdx = headers.indexOf('exposure');
    const filterIdx = headers.indexOf('filter');
    const frametypeIdx = headers.indexOf('frametype');
    const gainIdx = headers.indexOf('gain');
    const offsetIdx = headers.indexOf('offset');
    const progressIdx = headers.indexOf('progress');

    return sequence.grid.map(row => {
      const progressObj = typeof row[progressIdx] === 'object' ? row[progressIdx] : { dynlabel: '', value: 0 };

      return {
        count: row[countIdx] || 0,
        exposure: row[exposureIdx] || 0,
        filter: row[filterIdx] || 0,
        frametype: row[frametypeIdx] || 'L',
        gain: row[gainIdx] || 0,
        offset: row[offsetIdx] || 0,
        progress: progressObj
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
   * Start sequence
   */
  startSequence(): void {
    console.log('Starting sequence');
    this.wsService.setProperty('Sequencer', 'actions', {
      startsequence: true
    });
  }

  /**
   * Stop sequence
   */
  stopSequence(): void {
    console.log('Stopping sequence');
    this.wsService.setProperty('Sequencer', 'actions', {
      abortsequence: true
    });
  }

  /**
   * Update object properties
   */
  onObjectChange(elementName: string, value: any): void {
    console.log(`Updating object ${elementName} to ${value}`);
    this.wsService.setProperty('Sequencer', 'object', {
      [elementName]: value
    });
  }

  /**
   * Update devices
   */
  onDevicesChange(elementName: string, value: any): void {
    console.log(`Updating devices ${elementName} to ${value}`);
    this.wsService.setProperty('Sequencer', 'devices', {
      [elementName]: value
    });
  }

  /**
   * Update optics
   */
  onOpticChange(elementName: string, value: any): void {
    console.log(`Updating optic ${elementName} to ${value}`);
    this.wsService.setProperty('Sequencer', 'optic', {
      [elementName]: value
    });
  }

  /**
   * Update parameters (advanced options)
   */
  onParametersChange(elementName: string, value: any): void {
    console.log(`Updating parameters ${elementName} to ${value}`);
    this.wsService.setProperty('Sequencer', 'parameters', {
      [elementName]: value
    });
  }

  /**
   * Update parms (exposure/gain/offset)
   */
  onParmsChange(elementName: string, value: any): void {
    console.log(`Updating parms ${elementName} to ${value}`);
    this.wsService.setProperty('Sequencer', 'parms', {
      [elementName]: value
    });
  }

  /**
   * Update sequence grid row
   */
  onSequenceRowChange(rowIndex: number, columnName: string, value: any): void {
    console.log(`Updating sequence row ${rowIndex}, column ${columnName} to ${value}`);
    // TODO: Implement grid update via WebSocket
    // This would need to send the entire grid back to the server
  }

  /**
   * Add a new row to the sequence grid
   */
  addSequenceRow(): void {
    console.log('Adding new sequence row');
    const newRow: SequenceRow = {
      count: 1,
      exposure: 10,
      filter: 1,
      frametype: 'L',
      gain: 0,
      offset: 0,
      progress: { dynlabel: '0/1', value: 0 }
    };
    this.sequenceRows.push(newRow);
    // TODO: Send updated grid to server
  }

  /**
   * Delete a sequence row
   */
  deleteSequenceRow(rowIndex: number): void {
    console.log(`Deleting sequence row ${rowIndex}`);
    this.sequenceRows.splice(rowIndex, 1);
    // TODO: Send updated grid to server
  }

  /**
   * Get filter label for a filter ID
   */
  getFilterLabel(filterId: number): string {
    return this.filterOptions.get(filterId) || `Filter ${filterId}`;
  }

  /**
   * Get frame type label for a frame type code
   */
  getFrameTypeLabel(frameType: string): string {
    return this.frameTypeOptions.get(frameType) || frameType;
  }

  /**
   * Check if module is loaded
   */
  get isModuleLoaded(): boolean {
    return this.sequencerModule !== null;
  }

  /**
   * Get property element safely
   */
  getPropertyElement(propertyName: string, elementName: string): any {
    if (!this.sequencerModule || !this.sequencerModule.properties[propertyName]) {
      return null;
    }
    return this.sequencerModule.properties[propertyName].elements[elementName];
  }
}
