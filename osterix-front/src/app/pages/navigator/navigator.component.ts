import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element, ImageElement } from '../../models/ost.models';
import { Subscription } from 'rxjs';
import { HistogramDialogComponent } from '../focus/histogram-dialog.component';
import { StatisticsDialogComponent } from '../focus/statistics-dialog.component';

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

  // Search results grid
  displayedColumns: string[] = ['catalog', 'code', 'name', 'ra', 'dec', 'mag', 'diam', 'alias', 'actions'];
  searchResults: SearchResult[] = [];

  // Selected target
  selectedTarget: SearchResult | null = null;
  targetName: string = '';
  targetRA: number = 0;
  targetDEC: number = 0;

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
        this.searchName = search.elements['name'].value;
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
        this.targetName = actions.elements['targetname'].value;
      }
      if (actions.elements['targetra']) {
        this.targetRA = actions.elements['targetra'].value;
      }
      if (actions.elements['targetde']) {
        this.targetDEC = actions.elements['targetde'].value;
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

    // Update the target properties in the backend
    this.wsService.setProperty('Navigator', 'actions', {
      targetname: this.targetName,
      targetra: this.targetRA,
      targetde: this.targetDEC
    });
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
