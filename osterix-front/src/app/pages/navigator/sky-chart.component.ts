import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

declare var window: any;

/**
 * Sky Chart Component using d3-celestial
 * Displays an interactive celestial map with stars, constellations, DSOs, and Milky Way
 */
@Component({
  selector: 'app-sky-chart',
  templateUrl: './sky-chart.component.html',
  styleUrls: ['./sky-chart.component.css']
})
export class SkyChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('skyChartContainer', { static: false }) containerRef?: ElementRef;

  // Input properties
  private _targetRA: number = 0;
  private _targetDEC: number = 0;

  @Input()
  set targetRA(value: number) {
    // Convert from hours to degrees if needed
    let converted: number;
    if (value > 24) {
      converted = value;
    } else if (value >= 0 && value <= 24) {
      converted = value * 15;
    } else {
      converted = value;
    }
    this._targetRA = converted;
    this.updateCelestialCenter();
  }

  get targetRA(): number {
    return this._targetRA;
  }

  @Input()
  set targetDEC(value: number) {
    this._targetDEC = value;
    this.updateCelestialCenter();
  }

  get targetDEC(): number {
    return this._targetDEC;
  }

  @Input() fieldOfView: number = 10;
  displayFOV: number = 10;  // Display the actual FOV

  private celestialInitialized = false;
  private initialZoomValue: number = 1.0;  // Track the initial zoom to calculate actual FOV

  // Toggle state tracking
  private starsVisible = true;
  private constellationsVisible = true;
  private dsosVisible = true;
  private mwVisible = true;

  // Magnitude limit for stars and DSOs
  selectedMagnitudeValue: string = '15';

  constructor() {}

  ngOnInit(): void {
    // Library is loaded via angular.json scripts configuration
  }

  ngAfterViewInit(): void {
    // Initialize d3-celestial after view has been rendered
    setTimeout(() => {
      this.initializeCelestial();
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.celestialInitialized) {
      if (changes['targetRA'] || changes['targetDEC']) {
        this.updateCelestialCenter();
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Initialize d3-celestial
   */
  private initializeCelestial(): void {
    if (!this.containerRef) return;

    // Check if Celestial library is loaded
    const Celestial = (window as any).Celestial;
    if (!Celestial) {
      console.error('Celestial library not loaded. window.Celestial is undefined');
      return;
    }

    // D3-celestial configuration
    const config = {
      width: 0,
      container: 'sky-chart-container',
      datapath: 'assets/celestial-data/',
      projection: 'orthographic',
      projectionRatio: 2,
      transform: 'equatorial',
      center: [this._targetRA, this._targetDEC, 0],
      follow: 'center',
      zoomlevel: this.calculateZoomLevel(),
      zoomextend: 180,
      adaptable: true,
      interactive: true,
      form: false,
      controls: false,
      lang: '',
      culture: 'iau',
      stars: {
        show: true,
        limit: 15,
        colors: true,
        style: { fill: '#ffffff', opacity: 1 },
        names: true,
        proper: false,
        desig: false,
        namelimit: 2.5,
        size: 7,
        exponent: -0.28,
        data: 'stars.14.json'
      },
      dsos: {
        show: true,
        limit: 15,
        colors: true,
        style: { fill: '#cccccc', stroke: '#cccccc', width: 2, opacity: 1 },
        names: true,
        desig: true,
        namelimit: 6,
        namestyle: { fill: '#cccccc', font: '11px Helvetica, Arial, serif', align: 'left', baseline: 'top' },
        size: null,
        exponent: 1.4,
        data: 'dsos.14.json',
        symbols: {
          gg: { shape: 'circle', fill: '#ff0000' },
          g: { shape: 'ellipse', fill: '#ff0000' },
          s: { shape: 'ellipse', fill: '#ff0000' },
          s0: { shape: 'ellipse', fill: '#ff0000' },
          sd: { shape: 'ellipse', fill: '#ff0000' },
          e: { shape: 'ellipse', fill: '#ff0000' },
          i: { shape: 'ellipse', fill: '#ff0000' },
          oc: { shape: 'circle', fill: '#ffcc00', stroke: '#ffcc00', width: 1.5 },
          gc: { shape: 'circle', fill: '#ff9900' },
          en: { shape: 'square', fill: '#ff00cc' },
          bn: { shape: 'square', fill: '#ff00cc', stroke: '#ff00cc', width: 2 },
          sfr: { shape: 'square', fill: '#cc00ff', stroke: '#cc00ff', width: 2 },
          rn: { shape: 'square', fill: '#0088ff' },
          pn: { shape: 'diamond', fill: '#00cccc' },
          snr: { shape: 'diamond', fill: '#ff00cc' },
          dn: { shape: 'square', fill: '#999999', stroke: '#999999', width: 2 },
          pos: { shape: 'marker', fill: '#cccccc', stroke: '#cccccc', width: 1.5 }
        }
      },
      constellations: {
        show: true,
        names: true,
        desig: true,
        namestyle: { fill: '#cccc99', align: 'center', baseline: 'middle', font: '14px Helvetica, Arial, sans-serif' },
        lines: true,
        linestyle: { stroke: '#cccccc', width: 1, opacity: 0.6 },
        bounds: false,
        boundstyle: { stroke: '#cccc00', width: 0.5, opacity: 0.8, dash: [2, 4] }
      },
      mw: {
        show: true,
        style: { fill: '#ffffff', opacity: 0.15 }
      },
      lines: {
        graticule: { show: false },
        equatorial: { show: false },
        ecliptic: { show: false },
        galactic: { show: false },
        supergalactic: { show: false }
      }
    };

    try {
      Celestial.display(config);
      this.celestialInitialized = true;
      // Ensure the celestial map is centered on the target
      this.updateCelestialCenter();
    } catch (e) {
      console.error('Failed to initialize Celestial:', e);
    }
  }

  /**
   * Update the center of the celestial map
   */
  private updateCelestialCenter(): void {
    if (!this.celestialInitialized) return;

    const Celestial = (window as any).Celestial;
    if (!Celestial) return;

    try {
      Celestial.rotate({
        center: [this._targetRA, this._targetDEC, 0]
      });
    } catch (e) {
      console.error('Failed to update celestial center:', e);
    }
  }

  /**
   * Set initial zoom level based on desired FOV
   */
  public setInitialZoom(fov: number): void {
    if (!this.celestialInitialized) return;

    const Celestial = (window as any).Celestial;
    if (!Celestial) return;

    try {
      const currentZoom = Celestial.zoomBy();
      const targetZoom = 180 / fov;
      const zoomRatio = targetZoom / currentZoom;
      console.log('Setting initial zoom - FOV:', fov, 'zoom ratio:', zoomRatio);
      Celestial.zoomBy(zoomRatio);
      this.initialZoomValue = Celestial.zoomBy();
    } catch (e) {
      console.error('Failed to set initial zoom:', e);
    }
  }

  /**
   * Get the current actual FOV based on current zoom
   */
  public getActualFOV(): number {
    const Celestial = (window as any).Celestial;
    if (!Celestial || !this.celestialInitialized) return this.fieldOfView;

    try {
      const currentZoom = Celestial.zoomBy();
      // FOV calculation: start from 180 degrees, apply inverse zoom
      return 180 / currentZoom;
    } catch (e) {
      return this.fieldOfView;
    }
  }

  /**
   * Reset view to target coordinates and reset zoom
   */
  public resetToTarget(): void {
    if (!this.celestialInitialized) return;

    const Celestial = (window as any).Celestial;
    if (!Celestial) return;

    try {
      Celestial.rotate({
        center: [this._targetRA, this._targetDEC, 0]
      });
      // Reset zoom to 1.0 (no zoom, full 180 degrees)
      const currentZoom = Celestial.zoomBy();
      Celestial.zoomBy(1.0 / currentZoom);
    } catch (e) {
      console.error('Failed to reset view:', e);
    }
  }

  /**
   * Calculate zoom level based on field of view
   * FOV 180 = zoom 0, FOV 1 = zoom ~13
   */
  private calculateZoomLevel(): number {
    // d3-celestial uses zoom levels where higher = more zoomed in
    // Mapping: FOV 180 = 0, FOV 1 = ~13
    const zoomLevel = Math.log(180 / this.fieldOfView) / Math.log(1.5);
    return Math.max(0, Math.min(20, zoomLevel));
  }


  /**
   * Update magnitude limit for stars and DSOs
   */
  onMagnitudeLimitChange(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;

    const magnitudeLimit = parseInt(this.selectedMagnitudeValue, 10) || 15;

    try {
      Celestial.apply({
        stars: {
          limit: magnitudeLimit
        },
        dsos: {
          limit: magnitudeLimit
        }
      });
    } catch (e) {
      console.error('Failed to update magnitude limit:', e);
    }
  }

  /**
   * Toggle star display
   */
  toggleStars(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      this.starsVisible = !this.starsVisible;
      Celestial.apply({
        stars: {
          show: this.starsVisible
        }
      });
    } catch (e) {
      console.error('Failed to toggle stars:', e);
    }
  }

  /**
   * Toggle constellation display (lines and names)
   */
  toggleConstellations(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      this.constellationsVisible = !this.constellationsVisible;
      Celestial.apply({
        constellations: {
          lines: this.constellationsVisible,
          names: this.constellationsVisible
        }
      });
    } catch (e) {
      console.error('Failed to toggle constellations:', e);
    }
  }

  /**
   * Toggle DSO display
   */
  toggleDSOs(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      this.dsosVisible = !this.dsosVisible;
      Celestial.apply({
        dsos: {
          show: this.dsosVisible
        }
      });
    } catch (e) {
      console.error('Failed to toggle DSOs:', e);
    }
  }

  /**
   * Toggle Milky Way display
   */
  toggleMilkyWay(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      this.mwVisible = !this.mwVisible;
      Celestial.apply({
        mw: {
          show: this.mwVisible
        }
      });
    } catch (e) {
      console.error('Failed to toggle Milky Way:', e);
    }
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      Celestial.zoomBy(1.5);
    } catch (e) {
      console.error('Failed to zoom in:', e);
    }
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      Celestial.zoomBy(1 / 1.5);
    } catch (e) {
      console.error('Failed to zoom out:', e);
    }
  }

  /**
   * Reset zoom and center
   */
  resetZoom(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;
    try {
      Celestial.zoomReset();
      this.updateCelestialCenter();
    } catch (e) {
      console.error('Failed to reset zoom:', e);
    }
  }
}
