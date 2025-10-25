import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element, ImageElement } from '../../models/ost.models';
import { ParametersDialogComponent, ParametersDialogData } from './parameters-dialog.component';
import { GuiderHistogramDialogComponent } from './histogram-dialog.component';
import { GuiderStatisticsDialogComponent } from './statistics-dialog.component';
import { GuidingData } from './guiding-graph.component';
import { DriftData } from './drift-graph.component';

@Component({
  selector: 'app-guider',
  templateUrl: './guider.component.html',
  styleUrls: ['./guider.component.css']
})
export class GuiderComponent implements OnInit, OnDestroy {
  guiderModule: Module | null = null;
  private moduleSubscription?: Subscription;

  // Image
  imageUrl: string = '';
  imageElement: ImageElement | null = null;
  fullscreenImageUrl: string | null = null;

  // Actions property elements
  loopEnabled: boolean = false;
  loopValue: boolean = false;
  ditherEnabled: boolean = false;
  ditherValue: boolean = false;
  calibrateEnabled: boolean = false;
  guideEnabled: boolean = false;
  abortGuiderEnabled: boolean = false;
  clearCalibrationEnabled: boolean = false;

  // Parameters property elements (for dialog)
  parametersEnabled: boolean = false;
  parametersElements: { [key: string]: Element } = {};

  // Devices property elements (for dialog)
  devicesEnabled: boolean = false;
  devicesElements: { [key: string]: Element } = {};

  // Optic property elements (for dialog)
  opticEnabled: boolean = false;
  opticElements: { [key: string]: Element } = {};

  // Guide parameters property elements (for dialog)
  guideParamsEnabled: boolean = false;
  guideParamsElements: { [key: string]: Element } = {};

  // Calibration parameters property elements (for dialog)
  calParamsEnabled: boolean = false;
  calParamsElements: { [key: string]: Element } = {};

  // Disabled corrections property elements (for dialog)
  disCorrectionEnabled: boolean = false;
  disCorrectionElements: { [key: string]: Element } = {};

  // Reversed corrections property elements (for dialog)
  revCorrectionEnabled: boolean = false;
  revCorrectionElements: { [key: string]: Element } = {};

  // Guiding graph data
  guidingData: GuidingData | null = null;

  // Drift graph data
  driftData: DriftData | null = null;

  // Values property elements (current session values)
  valuesEnabled: boolean = false;
  valuesElements: { [key: string]: Element } = {};
  valuesKeysCache: string[] = [];

  constructor(
    private websocketService: WebsocketService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.moduleSubscription = this.websocketService.state$.subscribe(state => {
      // Try both 'Guider' and 'guider' for module name (case sensitivity)
      this.guiderModule = state.modules['Guider'] || state.modules['guider'] || null;
      console.log('Guider module state:', this.guiderModule);
      if (this.guiderModule) {
        this.updateFromModule();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.moduleSubscription) {
      this.moduleSubscription.unsubscribe();
    }
  }

  private updateFromModule(): void {
    if (!this.guiderModule) return;

    // Update image from 'image' property
    const imageProperty = this.guiderModule.properties['image'];
    console.log('Image property:', imageProperty);
    if (imageProperty) {
      const imageElement = imageProperty.elements['image'] as ImageElement;
      console.log('Image element:', imageElement);
      if (imageElement && imageElement.type === 'img' && imageElement.urljpeg) {
        this.imageElement = imageElement;
        // Build complete URL with protocol, host, port and /ostmedia/ folder
        const protocol = window.location.protocol; // 'http:' or 'https:'
        const hostname = window.location.hostname; // e.g., 'localhost'
        const port = 80; // Web server port
        // Add timestamp to force browser to reload the image (avoid cache)
        const timestamp = new Date().getTime();
        this.imageUrl = `${protocol}//${hostname}:${port}/ostmedia/${imageElement.urljpeg}?t=${timestamp}`;
        console.log('Guider image URL loaded:', this.imageUrl);
        console.log('urljpeg value:', imageElement.urljpeg);
      } else {
        console.log('Image element check failed:', {
          hasElement: !!imageElement,
          type: imageElement?.type,
          hasUrljpeg: !!imageElement?.urljpeg
        });
      }
    } else {
      console.log('No image property found in module');
    }

    // Update actions from 'actions' property
    const actionsProperty = this.guiderModule.properties['actions'];
    if (actionsProperty) {
      this.updateActionsFromProperty(actionsProperty);
    }

    // Update parameters from 'parameters' property
    const parametersProperty = this.guiderModule.properties['parameters'];
    if (parametersProperty) {
      this.parametersEnabled = parametersProperty.enabled;
      this.parametersElements = parametersProperty.elements;
    }

    // Update devices from 'devices' property
    const devicesProperty = this.guiderModule.properties['devices'];
    if (devicesProperty) {
      this.devicesEnabled = devicesProperty.enabled;
      this.devicesElements = devicesProperty.elements;
    }

    // Update optic from 'optic' property
    const opticProperty = this.guiderModule.properties['optic'];
    if (opticProperty) {
      this.opticEnabled = opticProperty.enabled;
      this.opticElements = opticProperty.elements;
    }

    // Update guide parameters from 'guideParams' property
    const guideParamsProperty = this.guiderModule.properties['guideParams'];
    if (guideParamsProperty) {
      this.guideParamsEnabled = guideParamsProperty.enabled;
      this.guideParamsElements = guideParamsProperty.elements;
    }

    // Update calibration parameters from 'calParams' property
    const calParamsProperty = this.guiderModule.properties['calParams'];
    if (calParamsProperty) {
      this.calParamsEnabled = calParamsProperty.enabled;
      this.calParamsElements = calParamsProperty.elements;
    }

    // Update disabled corrections from 'disCorrections' property
    const disCorrectionProperty = this.guiderModule.properties['disCorrections'];
    if (disCorrectionProperty) {
      this.disCorrectionEnabled = disCorrectionProperty.enabled;
      this.disCorrectionElements = disCorrectionProperty.elements;
    }

    // Update reversed corrections from 'revCorrections' property
    const revCorrectionProperty = this.guiderModule.properties['revCorrections'];
    if (revCorrectionProperty) {
      this.revCorrectionEnabled = revCorrectionProperty.enabled;
      this.revCorrectionElements = revCorrectionProperty.elements;
    }

    // Update guiding data from 'guiding' property
    const guidingProperty = this.guiderModule.properties['guiding'];
    if (guidingProperty) {
      const guidingGrid = (guidingProperty as any).grid;
      const elements = guidingProperty.elements;

      this.guidingData = {
        grid: guidingGrid || [],
        time: elements?.['time']?.value,
        RA: elements?.['RA']?.value,
        DE: elements?.['DE']?.value,
        RMS: elements?.['RMS']?.value,
        SNR: elements?.['SNR']?.value,
        pRA: elements?.['pRA']?.value,
        pDE: elements?.['pDE']?.value
      };
    }

    // Update drift data from 'drift' property
    const driftProperty = this.guiderModule.properties['drift'];
    if (driftProperty) {
      const driftGrid = (driftProperty as any).grid;
      const graphParams = (driftProperty as any).graphParams;

      this.driftData = {
        grid: driftGrid || [],
        graphParams: graphParams
      };
    }

    // Update values from 'values' property
    const valuesProperty = this.guiderModule.properties['values'];
    if (valuesProperty) {
      this.valuesEnabled = valuesProperty.enabled;
      this.valuesElements = valuesProperty.elements;
      // Create sorted keys cache
      this.valuesKeysCache = Object.keys(this.valuesElements).sort((a, b) => {
        const orderA = this.valuesElements[a]?.order || '';
        const orderB = this.valuesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });
    }
  }

  private updateActionsFromProperty(property: Property): void {
    // Loop toggle
    const loopElement = property.elements['loop'];
    if (loopElement && loopElement.type === 'bool') {
      this.loopEnabled = property.enabled;
      this.loopValue = loopElement.value;
    }

    // Dither toggle
    const ditherElement = property.elements['dither'];
    if (ditherElement && ditherElement.type === 'bool') {
      this.ditherEnabled = property.enabled;
      this.ditherValue = ditherElement.value;
    }

    // Action buttons
    this.calibrateEnabled = property.enabled && !!property.elements['calibrate'];
    this.guideEnabled = property.enabled && !!property.elements['guide'];
    this.abortGuiderEnabled = property.enabled && !!property.elements['abortguider'];
    this.clearCalibrationEnabled = property.enabled && !!property.elements['clearcalibration'];
  }

  // Action handlers
  onLoopChange(value: boolean): void {
    this.websocketService.setProperty('Guider', 'actions', { loop: value });
  }

  onDitherChange(value: boolean): void {
    this.websocketService.setProperty('Guider', 'actions', { dither: value });
  }

  onCalibrate(): void {
    this.websocketService.setProperty('Guider', 'actions', { calibrate: true });
  }

  onGuide(): void {
    this.websocketService.setProperty('Guider', 'actions', { guide: true });
  }

  onAbortGuider(): void {
    this.websocketService.setProperty('Guider', 'actions', { abortguider: true });
  }

  onClearCalibration(): void {
    this.websocketService.setProperty('Guider', 'actions', { clearcalibration: true });
  }

  // Parameters dialog
  openParametersDialog(): void {
    const dialogData: ParametersDialogData = {
      parametersEnabled: this.parametersEnabled,
      parametersElements: this.parametersElements,
      devicesEnabled: this.devicesEnabled,
      devicesElements: this.devicesElements,
      opticEnabled: this.opticEnabled,
      opticElements: this.opticElements,
      guideParamsEnabled: this.guideParamsEnabled,
      guideParamsElements: this.guideParamsElements,
      calParamsEnabled: this.calParamsEnabled,
      calParamsElements: this.calParamsElements,
      disCorrectionEnabled: this.disCorrectionEnabled,
      disCorrectionElements: this.disCorrectionElements,
      revCorrectionEnabled: this.revCorrectionEnabled,
      revCorrectionElements: this.revCorrectionElements,
      globallovs: this.guiderModule?.globallovs || {},
      onParametersChange: (name: string, value: any) => this.onParametersChange(name, value),
      onDevicesChange: (name: string, value: any) => this.onDevicesChange(name, value),
      onOpticChange: (name: string, value: any) => this.onOpticChange(name, value),
      onGuideParamsChange: (name: string, value: any) => this.onGuideParamsChange(name, value),
      onCalParamsChange: (name: string, value: any) => this.onCalParamsChange(name, value),
      onDisCorrectionChange: (name: string, value: any) => this.onDisCorrectionChange(name, value),
      onRevCorrectionChange: (name: string, value: any) => this.onRevCorrectionChange(name, value)
    };

    this.dialog.open(ParametersDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData
    });
  }

  private onParametersChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'parameters', update);
  }

  private onDevicesChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'devices', update);
  }

  private onOpticChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'optic', update);
  }

  private onGuideParamsChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'guideParams', update);
  }

  private onCalParamsChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'calParams', update);
  }

  private onDisCorrectionChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'disCorrections', update);
  }

  private onRevCorrectionChange(name: string, value: any): void {
    const update: { [key: string]: any } = {};
    update[name] = value;
    this.websocketService.setProperty('Guider', 'revCorrections', update);
  }

  /**
   * Check if values object is not empty
   */
  hasValues(): boolean {
    return Object.keys(this.valuesElements).length > 0;
  }

  /**
   * Get element format property
   */
  getElementFormat(element: Element): string {
    return (element as any)?.format || '';
  }

  /**
   * Translate element labels from English to French
   */
  getElementLabel(key: string): string {
    const element = this.valuesElements[key];
    if (!element) {
      return key;
    }

    const label = element.label || key;

    // Map direct translations based on key or label
    const translations: { [key: string]: string } = {
      // By label
      'Pulse N': 'Pulse Nord',
      'Pulse S': 'Pulse Sud',
      'Pulse E': 'Pulse Est',
      'Pulse W': 'Pulse Ouest',
      'RMS RA': 'RMS AD',
      'RMS DEC': 'RMS DEC',
      'RMS Total': 'RMS Total',
      // By key (fallback)
      'pulseN': 'Pulse Nord',
      'pulseS': 'Pulse Sud',
      'pulseE': 'Pulse Est',
      'pulseW': 'Pulse Ouest',
      'rmsRA': 'RMS AD',
      'rmsDEC': 'RMS DEC',
      'rmsTotal': 'RMS Total'
    };

    // Try label first, then key
    return translations[label] || translations[key] || label;
  }

  /**
   * Check if value item is RMS
   */
  isRmsValue(key: string): boolean {
    return key.toLowerCase().includes('rms');
  }

  /**
   * Check if value item is Pulse
   */
  isPulseValue(key: string): boolean {
    return key.toLowerCase().includes('pulse');
  }

  /**
   * Get current image element
   */
  private getCurrentImageElement(): ImageElement | null {
    if (!this.guiderModule || !this.guiderModule.properties['image']) {
      return null;
    }
    const imageElement = this.guiderModule.properties['image'].elements['image'];
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
    this.dialog.open(GuiderHistogramDialogComponent, {
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
    this.dialog.open(GuiderStatisticsDialogComponent, {
      width: '600px',
      height: '600px',
      data: imageData
    });
  }

  /**
   * Toggle fullscreen view of the image
   */
  toggleFullscreen(): void {
    if (this.fullscreenImageUrl) {
      this.closeFullscreen();
    } else {
      this.openImageFullscreen();
    }
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
}
