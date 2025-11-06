import { Component, Inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SkyChartComponent } from './sky-chart.component';

@Component({
  selector: 'app-sky-chart-dialog',
  templateUrl: './sky-chart-dialog.component.html',
  styleUrls: ['./sky-chart-dialog.component.css']
})
export class SkyChartDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild(SkyChartComponent) skyChart?: SkyChartComponent;

  targetRA: number;
  targetDEC: number;
  fieldOfView: number = 10;

  // Control states
  starsVisible: boolean = true;
  constellationsVisible: boolean = true;
  dsosVisible: boolean = true;
  milkyWayVisible: boolean = true;
  equatorialGridVisible: boolean = false;
  graticuleGridVisible: boolean = false;
  eclipticGridVisible: boolean = false;
  horizonMarkerVisible: boolean = false;
  selectedMagnitude: string = '15';

  private storageKey = 'skyChartSettings';

  constructor(
    public dialogRef: MatDialogRef<SkyChartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.targetRA = data?.targetRA || 0;
    this.targetDEC = data?.targetDEC || 0;
    this.fieldOfView = data?.fieldOfView || 10;

    // Load saved settings from localStorage
    this.loadSettings();
  }

  ngAfterViewInit(): void {
    // After view is initialized, apply saved FOV to the chart
    if (this.skyChart) {
      setTimeout(() => {
        this.skyChart?.setInitialZoom(this.fieldOfView);
        // Apply all saved settings including grid colors
        this.updateCelestial();
      }, 1500);
    }
  }

  ngOnDestroy(): void {
    // Get the actual FOV from the sky chart before saving
    if (this.skyChart) {
      this.fieldOfView = this.skyChart.getActualFOV();
    }
    // Save all settings when dialog closes
    this.saveSettings();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem(this.storageKey);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.starsVisible = settings.starsVisible ?? this.starsVisible;
        this.constellationsVisible = settings.constellationsVisible ?? this.constellationsVisible;
        this.dsosVisible = settings.dsosVisible ?? this.dsosVisible;
        this.milkyWayVisible = settings.milkyWayVisible ?? this.milkyWayVisible;
        this.equatorialGridVisible = settings.equatorialGridVisible ?? this.equatorialGridVisible;
        this.graticuleGridVisible = settings.graticuleGridVisible ?? this.graticuleGridVisible;
        this.eclipticGridVisible = settings.eclipticGridVisible ?? this.eclipticGridVisible;
        this.horizonMarkerVisible = settings.horizonMarkerVisible ?? this.horizonMarkerVisible;
        this.selectedMagnitude = settings.selectedMagnitude ?? this.selectedMagnitude;
        this.fieldOfView = settings.fieldOfView ?? this.fieldOfView;
      }
    } catch (e) {
      console.warn('Failed to load sky chart settings:', e);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      const settings = {
        starsVisible: this.starsVisible,
        constellationsVisible: this.constellationsVisible,
        dsosVisible: this.dsosVisible,
        milkyWayVisible: this.milkyWayVisible,
        equatorialGridVisible: this.equatorialGridVisible,
        graticuleGridVisible: this.graticuleGridVisible,
        eclipticGridVisible: this.eclipticGridVisible,
        horizonMarkerVisible: this.horizonMarkerVisible,
        selectedMagnitude: this.selectedMagnitude,
        fieldOfView: this.fieldOfView
      };
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save sky chart settings:', e);
    }
  }

  toggleStars(): void {
    this.starsVisible = !this.starsVisible;
    this.updateCelestial();
  }

  toggleConstellations(): void {
    this.constellationsVisible = !this.constellationsVisible;
    this.updateCelestial();
  }

  toggleDSOs(): void {
    this.dsosVisible = !this.dsosVisible;
    this.updateCelestial();
  }

  toggleMilkyWay(): void {
    this.milkyWayVisible = !this.milkyWayVisible;
    this.updateCelestial();
  }

  toggleEquatorialGrid(): void {
    this.equatorialGridVisible = !this.equatorialGridVisible;
    this.updateCelestial();
  }

  toggleGraticuleGrid(): void {
    this.graticuleGridVisible = !this.graticuleGridVisible;
    this.updateCelestial();
  }

  toggleEclipticGrid(): void {
    this.eclipticGridVisible = !this.eclipticGridVisible;
    this.updateCelestial();
  }

  toggleHorizonMarker(): void {
    this.horizonMarkerVisible = !this.horizonMarkerVisible;
    this.updateCelestial();
  }

  onMagnitudeChange(): void {
    this.updateCelestial();
  }

  resetView(): void {
    if (this.skyChart) {
      this.skyChart.resetToTarget();
    }
  }

  selectTarget(): void {
    // Get the current center from d3-celestial
    const Celestial = (window as any).Celestial;
    let ra = this.targetRA;
    let dec = this.targetDEC;

    if (Celestial) {
      try {
        // Call rotate() without parameters to get the current center
        // d3-celestial returns center in degrees for both RA and DEC
        const center = Celestial.rotate();

        if (center && center.length >= 2) {
          // RA is returned in degrees, convert to hours (1 hour = 15 degrees)
          ra = center[0] / 15;
          // DEC is already in degrees
          dec = center[1];
        }
      } catch (e) {
        console.error('Failed to get center from Celestial:', e);
      }
    }

    // Close the dialog and save settings
    this.saveSettings();
    this.dialogRef.close({ action: 'selectTarget', ra: ra, dec: dec });
  }

  private updateCelestial(): void {
    const Celestial = (window as any).Celestial;
    if (!Celestial) return;

    try {
      const magnitudeLimit = parseInt(this.selectedMagnitude, 10) || 15;

      Celestial.apply({
        stars: {
          show: this.starsVisible,
          limit: magnitudeLimit
        },
        dsos: {
          show: this.dsosVisible,
          limit: magnitudeLimit
        },
        constellations: {
          lines: this.constellationsVisible,
          names: this.constellationsVisible
        },
        mw: {
          show: this.milkyWayVisible
        },
        lines: {
          graticule: { show: this.graticuleGridVisible, stroke: '#ffffff', width: 0.5, opacity: 0.6 },
          equatorial: { show: this.equatorialGridVisible, stroke: '#ffffff', width: 1.3, opacity: 0.7 },
          ecliptic: { show: this.eclipticGridVisible, stroke: '#ffffff', width: 1.3, opacity: 0.7 },
          galactic: { show: false, stroke: '#ffffff', width: 1.3, opacity: 0.7 }
        },
        horizon: {
          show: this.horizonMarkerVisible
        }
      });
    } catch (e) {
      console.error('Failed to update Celestial:', e);
    }
  }

}
