import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { UrlBuilderService } from '../../services/url-builder.service';
import { SettingsService } from '../../services/settings.service';
import { Module, Property, Element, ImageElement } from '../../models/ost.models';
import { Subscription } from 'rxjs';
import { SequenceRowDialogComponent, SequenceRowData, SequenceRowDialogData } from './sequence-row-dialog.component';
import { SequenceParametersDialogComponent, SequenceParametersDialogData } from './sequence-parameters-dialog.component';
import { HistogramDialogComponent } from '../focus/histogram-dialog.component';
import { StatisticsDialogComponent } from '../focus/statistics-dialog.component';

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
  displayedColumns: string[] = ['frametype', 'filter', 'exposure', 'count', 'gain', 'offset', 'progress', 'actions'];

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

  // Image URL from backend
  imageUrl: string | null = null;

  // Fullscreen image
  fullscreenImageUrl: string | null = null;

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
    private urlBuilder: UrlBuilderService,
    private dialog: MatDialog,
    private settingsService: SettingsService
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

    // Subscribe to settings request from header
    this.subscription.add(
      this.settingsService.settingsRequested$.subscribe(() => {
        this.openParametersDialog();
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

    // Extract image URL from 'image' property
    if (properties['image'] && properties['image'].elements['image']) {
      const imageElement = properties['image'].elements['image'] as ImageElement;
      if (imageElement.type === 'img' && imageElement.urljpeg) {
        // Add timestamp to force browser to reload the image (avoid cache)
        const timestamp = new Date().getTime();
        this.imageUrl = this.urlBuilder.buildMediaUrl(imageElement.urljpeg, timestamp);
        console.log('Image URL loaded:', this.imageUrl);
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
   * Edit a sequence row by opening a dialog
   */
  editSequenceRow(rowIndex: number): void {
    const row = this.sequenceRows[rowIndex];
    if (!row) return;

    const dialogData: SequenceRowDialogData = {
      title: `Éditer ligne ${rowIndex + 1}`,
      row: { ...row }, // Create a copy
      filterOptions: this.filterOptions,
      frameTypeOptions: this.frameTypeOptions,
      isNewRow: false
    };

    this.dialog.open(SequenceRowDialogComponent, {
      width: '500px',
      data: dialogData
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log(`Updating sequence row ${rowIndex}`, result);
        // Send Flupdate event to server
        this.wsService.updateGridLine('Sequencer', 'sequence', rowIndex, {
          count: result.count,
          exposure: result.exposure,
          filter: result.filter,
          frametype: result.frametype,
          gain: result.gain,
          offset: result.offset
        });
      }
    });
  }

  /**
   * Add a new row to the sequence grid
   */
  addSequenceRow(): void {
    console.log('Adding new sequence row');
    const newRow: SequenceRowData = {
      count: 1,
      exposure: 10,
      filter: 1,
      frametype: 'L',
      gain: 0,
      offset: 0
    };

    const dialogData: SequenceRowDialogData = {
      title: 'Ajouter une nouvelle ligne de séquence',
      row: newRow,
      filterOptions: this.filterOptions,
      frameTypeOptions: this.frameTypeOptions,
      isNewRow: true
    };

    this.dialog.open(SequenceRowDialogComponent, {
      width: '500px',
      data: dialogData
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating new sequence row', result);
        // Send Flcreate event to server
        this.wsService.createGridLine('Sequencer', 'sequence', {
          count: result.count,
          exposure: result.exposure,
          filter: result.filter,
          frametype: result.frametype,
          gain: result.gain,
          offset: result.offset
        });
      }
    });
  }

  /**
   * Delete a sequence row
   */
  deleteSequenceRow(rowIndex: number): void {
    console.log(`Deleting sequence row ${rowIndex}`);
    // Send Fldelete event to server
    this.wsService.deleteGridLine('Sequencer', 'sequence', rowIndex);
  }

  /**
   * Move a sequence row up
   */
  moveSequenceRowUp(rowIndex: number): void {
    if (rowIndex > 0) {
      console.log(`Moving sequence row ${rowIndex} up`);
      // Send Flup event to server
      this.wsService.moveGridLineUp('Sequencer', 'sequence', rowIndex);
    }
  }

  /**
   * Move a sequence row down
   */
  moveSequenceRowDown(rowIndex: number): void {
    if (rowIndex < this.sequenceRows.length - 1) {
      console.log(`Moving sequence row ${rowIndex} down`);
      // Send Fldown event to server
      this.wsService.moveGridLineDown('Sequencer', 'sequence', rowIndex);
    }
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

  /**
   * Open parameters dialog
   */
  openParametersDialog(): void {
    const dialogData: SequenceParametersDialogData = {
      // Object target
      objectName: this.objectName,
      objectRA: this.objectRA,
      objectDEC: this.objectDEC,
      objectEnabled: this.devicesEnabled,

      // Devices
      devicesElements: this.devicesElements,
      devicesEnabled: this.devicesEnabled,

      // Advanced parameters
      autoFocusAtStart: this.autoFocusAtStart,
      autoFocusOnFilterChange: this.autoFocusOnFilterChange,
      focusModule: this.focusModule,
      suspendGuidingDuringFocus: this.suspendGuidingDuringFocus,
      guiderModule: this.guiderModule,
      guidingSettleTime: this.guidingSettleTime,
      parametersEnabled: this.parametersEnabled,

      // Camera parameters
      exposure: this.exposure,
      gain: this.gain,
      offset: this.offset,
      parmsEnabled: this.parmsEnabled,

      // Optic
      opticElements: this.opticElements,
      opticEnabled: this.opticEnabled,

      // Callbacks
      onObjectChange: (name: string, value: any) => this.onObjectChange(name, value),
      onDevicesChange: (name: string, value: any) => this.onDevicesChange(name, value),
      onParametersChange: (name: string, value: any) => this.onParametersChange(name, value),
      onParmsChange: (name: string, value: any) => this.onParmsChange(name, value),
      onOpticChange: (name: string, value: any) => this.onOpticChange(name, value)
    };

    this.dialog.open(SequenceParametersDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
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
    if (!this.sequencerModule || !this.sequencerModule.properties['image']) {
      return null;
    }
    const imageElement = this.sequencerModule.properties['image'].elements['image'];
    if (imageElement && imageElement.type === 'img') {
      return imageElement as ImageElement;
    }
    return null;
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
}
