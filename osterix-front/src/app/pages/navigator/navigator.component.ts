import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element, ImageElement } from '../../models/ost.models';
import { Subscription } from 'rxjs';
import { HistogramDialogComponent } from '../focus/histogram-dialog.component';
import { StatisticsDialogComponent } from '../focus/statistics-dialog.component';
import { NavigatorParametersDialogComponent } from './parameters-dialog.component';

interface SearchResult {
  catalog: string;
  code: string;
  ra: number;
  dec: number;
  ns: string;
  diam: number;
  mag: number;
  name: string;
  alias: string;
}

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css']
})
export class NavigatorComponent implements OnInit, OnDestroy {
  // Module data
  navigatorModule: Module | null = null;

  // Search parameters
  searchName: string = '';
  searchNameLastSent: string = ''; // Track last sent value to avoid circular updates

  // Search results grid
  displayedColumns: string[] = ['catalog', 'code', 'name', 'ra', 'dec', 'mag', 'diam', 'alias', 'actions'];
  searchResults: SearchResult[] = [];

  // Selected target
  selectedTarget: SearchResult | null = null;
  targetName: string = '';
  targetRA: number = 0;
  targetDEC: number = 0;
  targetNameLastSent: string = '';
  targetRALastSent: number = 0;
  targetDECLastSent: number = 0;

  // Current selection in JNOW
  selectionJD: string = '';
  selectionCode: string = '';
  selectionRA: number = 0;
  selectionDEC: number = 0;
  selectionNS: string = '';

  // Devices and optic properties
  devicesElements: { [key: string]: Element } = {};
  opticElements: { [key: string]: Element } = {};
  devicesEnabled: boolean = true;
  opticEnabled: boolean = true;

  // Camera parameters
  exposure: number = 10;
  gain: number = 0;
  offset: number = 0;
  parmsEnabled: boolean = true;

  // Centering parameters
  maxIterations: number = 5;
  tolerance: number = 30.0;
  centeringEnabled: boolean = true;

  // Image URL from backend
  imageUrl: string | null = null;

  // Fullscreen image
  fullscreenImageUrl: string | null = null;

  // Status
  isRunning: boolean = false;
  currentStatus: string = 'Idle';
  progressValue: number = 0;

  private subscription = new Subscription();
  private targetChangeTimeout: any = null;
  private searchNameChangeTimeout: any = null;

  constructor(
    public wsService: WebsocketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes to get Navigator module data
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Navigator']) {
          this.navigatorModule = state.modules['Navigator'];
          console.log('Navigator module loaded:', this.navigatorModule);
          this.updateFromModule();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Extract data from Navigator module properties
   */
  private updateFromModule(): void {
    if (!this.navigatorModule) return;

    const properties = this.navigatorModule.properties;

    // Extract search parameters
    if (properties['search']) {
      const search = properties['search'];
      if (search.elements['name']) {
        const newValue = search.elements['name'].value;
        // Only update if it's different from what we sent (avoid overwriting user input)
        if (newValue !== this.searchNameLastSent) {
          this.searchName = newValue;
        }
      }
    }

    // Extract search results grid
    if (properties['results']) {
      const results = properties['results'];
      if (results.grid && results.gridheaders) {
        this.searchResults = this.parseResultsGrid(results);
      }
    }

    // Extract target parameters
    if (properties['actions']) {
      const actions = properties['actions'];
      if (actions.elements['targetname']) {
        const newValue = actions.elements['targetname'].value;
        // Only update if different from what we sent
        if (newValue !== this.targetNameLastSent) {
          this.targetName = newValue;
        }
      }
      if (actions.elements['targetra']) {
        const newValue = actions.elements['targetra'].value;
        // Only update if different from what we sent
        if (newValue !== this.targetRALastSent) {
          this.targetRA = newValue;
        }
      }
      if (actions.elements['targetde']) {
        const newValue = actions.elements['targetde'].value;
        // Only update if different from what we sent
        if (newValue !== this.targetDECLastSent) {
          this.targetDEC = newValue;
        }
      }
    }

    // Extract selection in JNOW
    if (properties['selectnow']) {
      const selectnow = properties['selectnow'];
      if (selectnow.elements['jd']) {
        this.selectionJD = selectnow.elements['jd'].value;
      }
      if (selectnow.elements['code']) {
        this.selectionCode = selectnow.elements['code'].value;
      }
      if (selectnow.elements['RA']) {
        this.selectionRA = selectnow.elements['RA'].value;
      }
      if (selectnow.elements['DEC']) {
        this.selectionDEC = selectnow.elements['DEC'].value;
      }
      if (selectnow.elements['NS']) {
        this.selectionNS = selectnow.elements['NS'].value;
      }
    }

    // Extract devices
    if (properties['devices']) {
      const devices = properties['devices'];
      this.devicesEnabled = devices.enabled !== undefined ? devices.enabled : true;
      this.devicesElements = devices.elements || {};
    }

    // Extract optic
    if (properties['optic']) {
      const optic = properties['optic'];
      this.opticEnabled = optic.enabled !== undefined ? optic.enabled : true;
      this.opticElements = optic.elements || {};
    }

    // Extract camera parameters
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

    // Extract centering parameters
    if (properties['centeringparams']) {
      const centering = properties['centeringparams'];
      this.centeringEnabled = centering.enabled !== undefined ? centering.enabled : true;
      if (centering.elements['maxiterations']) {
        this.maxIterations = centering.elements['maxiterations'].value;
      }
      if (centering.elements['tolerance']) {
        this.tolerance = centering.elements['tolerance'].value;
      }
    }

    // Extract image URL from 'image' property
    if (properties['image'] && properties['image'].elements['image']) {
      const imageElement = properties['image'].elements['image'] as ImageElement;
      if (imageElement.type === 'img' && imageElement.urljpeg) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = 80;
        const timestamp = new Date().getTime();
        this.imageUrl = `${protocol}//${hostname}:${port}/ostmedia/${imageElement.urljpeg}?t=${timestamp}`;
        console.log('Image URL loaded:', this.imageUrl);
      }
    }

    // Extract status (use a default for now)
    this.currentStatus = 'Idle';
    this.isRunning = false;
  }

  /**
   * Parse results grid data
   */
  private parseResultsGrid(results: Property): SearchResult[] {
    if (!results.grid || !results.gridheaders) {
      return [];
    }

    const headers = results.gridheaders;
    const catalogIdx = headers.indexOf('catalog');
    const codeIdx = headers.indexOf('code');
    const raIdx = headers.indexOf('RA');
    const decIdx = headers.indexOf('DEC');
    const nsIdx = headers.indexOf('NS');
    const diamIdx = headers.indexOf('diam');
    const magIdx = headers.indexOf('mag');
    const nameIdx = headers.indexOf('name');
    const aliasIdx = headers.indexOf('alias');

    return results.grid.map(row => ({
      catalog: row[catalogIdx] || '',
      code: row[codeIdx] || '',
      ra: parseFloat(row[raIdx]) || 0,
      dec: parseFloat(row[decIdx]) || 0,
      ns: row[nsIdx] || '',
      diam: parseFloat(row[diamIdx]) || 0,
      mag: parseFloat(row[magIdx]) || 0,
      name: row[nameIdx] || '',
      alias: row[aliasIdx] || ''
    }));
  }

  /**
   * Update search name in backend (with debounce)
   */
  onSearchNameChange(): void {
    // Clear existing timeout
    if (this.searchNameChangeTimeout) {
      clearTimeout(this.searchNameChangeTimeout);
    }

    // Set new timeout to send after user stops typing (500ms)
    this.searchNameChangeTimeout = setTimeout(() => {
      console.log(`Updated search name to: ${this.searchName}`);
      // Track the value we're sending to avoid overwriting it when backend responds
      this.searchNameLastSent = this.searchName;
      // Send property update to backend
      this.wsService.setProperty('Navigator', 'search', {
        name: this.searchName
      });
    }, 500);
  }

  /**
   * Search for an object (send Fposticon event)
   */
  performSearch(): void {
    if (!this.searchName.trim()) return;

    console.log(`Searching for: ${this.searchName}`);
    // Send posticon event to trigger search in backend
    this.wsService.sendPostIcon('Navigator', 'search', {
      name: {}
    });
  }

  /**
   * Select a target from search results
   */
  selectTarget(result: SearchResult, index: number): void {
    console.log(`Selected target: ${result.name} (${result.code})`);
    this.selectedTarget = result;

    // Send selection event to backend (Flselect)
    this.wsService.selectGridLine('Navigator', 'results', index);

    // Update target coordinates
    this.targetName = result.name || result.code;
    this.targetRA = result.ra;
    this.targetDEC = result.dec;

    // Track what we're sending
    this.targetNameLastSent = this.targetName;
    this.targetRALastSent = this.targetRA;
    this.targetDECLastSent = this.targetDEC;

    // Update the target properties in the backend
    this.onTargetChange();
  }

  /**
   * Update target properties in backend (with debounce)
   */
  onTargetChange(): void {
    // Clear existing timeout
    if (this.targetChangeTimeout) {
      clearTimeout(this.targetChangeTimeout);
    }

    // Set new timeout to send after user stops typing (500ms)
    this.targetChangeTimeout = setTimeout(() => {
      console.log(`Updated target: ${this.targetName} (${this.targetRA}, ${this.targetDEC})`);
      // Track what we're sending
      this.targetNameLastSent = this.targetName;
      this.targetRALastSent = this.targetRA;
      this.targetDECLastSent = this.targetDEC;
      // Send property update to backend
      this.wsService.setProperty('Navigator', 'actions', {
        targetname: this.targetName,
        targetra: this.targetRA,
        targetde: this.targetDEC
      });
    }, 500);
  }

  /**
   * Center the target
   */
  centerTarget(): void {
    console.log('Centering target');
    this.wsService.setProperty('Navigator', 'actions', {
      gototarget: true
    });
  }

  /**
   * Abort navigation
   */
  abortNavigation(): void {
    console.log('Aborting navigation');
    this.wsService.setProperty('Navigator', 'actions', {
      abortnavigator: true
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
    if (!this.navigatorModule || !this.navigatorModule.properties['image']) {
      return null;
    }
    const imageElement = this.navigatorModule.properties['image'].elements['image'];
    if (imageElement && imageElement.type === 'img') {
      return imageElement as ImageElement;
    }
    return null;
  }

  /**
   * Show histogram dialog
   */
  showHistogram(event: Event): void {
    event.stopPropagation();
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
    event.stopPropagation();
    const imageData = this.getCurrentImageElement();
    this.dialog.open(StatisticsDialogComponent, {
      width: '600px',
      height: '600px',
      data: imageData
    });
  }

  /**
   * Show parameters dialog
   */
  showParameters(): void {
    this.dialog.open(NavigatorParametersDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: {
        // Camera parameters from 'parms' property
        exposure: this.exposure,
        gain: this.gain,
        offset: this.offset,
        parmsEnabled: this.parmsEnabled,

        // Centering parameters from 'centeringparams' property
        maxIterations: this.maxIterations,
        tolerance: this.tolerance,
        centeringEnabled: this.centeringEnabled,

        // Devices and optic properties
        devicesElements: this.devicesElements,
        devicesEnabled: this.devicesEnabled,
        opticElements: this.opticElements,
        opticEnabled: this.opticEnabled,

        // Global LOVs
        globallovs: this.navigatorModule?.globallovs || {},

        // Callbacks for changes
        onParmsChange: (name: string, value: any) => {
          if (name === 'exposure') this.exposure = value;
          if (name === 'gain') this.gain = value;
          if (name === 'offset') this.offset = value;
          this.wsService.setProperty('Navigator', 'parms', {
            [name]: value
          });
        },

        onCenteringChange: (name: string, value: any) => {
          if (name === 'maxiterations') this.maxIterations = value;
          if (name === 'tolerance') this.tolerance = value;
          this.wsService.setProperty('Navigator', 'centeringparams', {
            [name]: value
          });
        },

        onDevicesChange: (name: string, value: any) => {
          if (this.devicesElements[name]) {
            this.devicesElements[name].value = value;
          }
          this.wsService.setProperty('Navigator', 'devices', {
            [name]: value
          });
        },

        onOpticChange: (name: string, value: any) => {
          if (this.opticElements[name]) {
            this.opticElements[name].value = value;
          }
          this.wsService.setProperty('Navigator', 'optic', {
            [name]: value
          });
        }
      }
    });
  }

  /**
   * Check if module is loaded
   */
  get isModuleLoaded(): boolean {
    return this.navigatorModule !== null;
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(ra: number, dec: number): string {
    return `${ra.toFixed(2)}° / ${dec.toFixed(2)}°`;
  }
}
