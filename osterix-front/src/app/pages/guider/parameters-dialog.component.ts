import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Element, GlobalLov } from '../../models/ost.models';

export interface ParametersDialogData {
  // Parameters from 'parameters' property
  parametersElements: { [key: string]: Element };
  parametersEnabled: boolean;

  // Devices and optic properties
  devicesElements: { [key: string]: Element };
  devicesEnabled: boolean;
  opticElements: { [key: string]: Element };
  opticEnabled: boolean;

  // Guiding parameters (guideParams property)
  guideParamsElements: { [key: string]: Element };
  guideParamsEnabled: boolean;

  // Calibration parameters (calParams property)
  calParamsElements: { [key: string]: Element };
  calParamsEnabled: boolean;

  // Disabled corrections (disCorrections property)
  disCorrectionElements: { [key: string]: Element };
  disCorrectionEnabled: boolean;

  // Reversed corrections (revCorrections property)
  revCorrectionElements: { [key: string]: Element };
  revCorrectionEnabled: boolean;

  // Global LOVs from module
  globallovs: { [key: string]: GlobalLov };

  // Callbacks for direct changes
  onParametersChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onOpticChange: (name: string, value: any) => void;
  onGuideParamsChange: (name: string, value: any) => void;
  onCalParamsChange: (name: string, value: any) => void;
  onDisCorrectionChange: (name: string, value: any) => void;
  onRevCorrectionChange: (name: string, value: any) => void;
}

interface ListOfValue {
  value: string;
  label: string;
}

@Component({
  selector: 'app-guider-parameters-dialog',
  templateUrl: './parameters-dialog.component.html',
  styleUrls: ['./parameters-dialog.component.css']
})
export class ParametersDialogComponent {
  // Cache all computed values to prevent change detection loops
  parametersKeysCache: string[] = [];
  devicesKeysCache: string[] = [];
  opticKeysCache: string[] = [];
  guideParamsKeysCache: string[] = [];
  calParamsKeysCache: string[] = [];
  disCorrectionKeysCache: string[] = [];
  revCorrectionKeysCache: string[] = [];

  parametersLovsCache: { [key: string]: ListOfValue[] } = {};
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};
  opticLovsCache: { [key: string]: ListOfValue[] } = {};
  guideParamsLovsCache: { [key: string]: ListOfValue[] } = {};
  calParamsLovsCache: { [key: string]: ListOfValue[] } = {};
  disCorrectionLovsCache: { [key: string]: ListOfValue[] } = {};
  revCorrectionLovsCache: { [key: string]: ListOfValue[] } = {};

  // Original values for reset functionality
  private originalParametersValues: { [key: string]: any } = {};
  private originalDevicesValues: { [key: string]: any } = {};
  private originalOpticValues: { [key: string]: any } = {};
  private originalGuideParamsValues: { [key: string]: any } = {};
  private originalCalParamsValues: { [key: string]: any } = {};
  private originalDisCorrectionValues: { [key: string]: any } = {};
  private originalRevCorrectionValues: { [key: string]: any } = {};

  constructor(
    public dialogRef: MatDialogRef<ParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParametersDialogData
  ) {
    // Initialize all cached values in constructor
    this.initializeCaches();
  }

  private initializeCaches(): void {
    // Cache parameters keys and values
    if (this.data.parametersElements) {
      this.parametersKeysCache = Object.keys(this.data.parametersElements).sort((a, b) => {
        const orderA = this.data.parametersElements[a]?.order || '';
        const orderB = this.data.parametersElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each parameter element
      this.parametersKeysCache.forEach(key => {
        this.parametersLovsCache[key] = this.computeElementLovs(key, 'parameters');
        this.originalParametersValues[key] = this.data.parametersElements[key]?.value;
      });
    }

    // Cache devices keys and values
    if (this.data.devicesElements) {
      this.devicesKeysCache = Object.keys(this.data.devicesElements).sort((a, b) => {
        const orderA = this.data.devicesElements[a]?.order || '';
        const orderB = this.data.devicesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each device element
      this.devicesKeysCache.forEach(key => {
        this.devicesLovsCache[key] = this.computeElementLovs(key, 'devices');
        this.originalDevicesValues[key] = this.data.devicesElements[key]?.value;
      });
    }

    // Cache optic keys and values
    if (this.data.opticElements) {
      this.opticKeysCache = Object.keys(this.data.opticElements).sort((a, b) => {
        const orderA = this.data.opticElements[a]?.order || '';
        const orderB = this.data.opticElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each optic element
      this.opticKeysCache.forEach(key => {
        this.opticLovsCache[key] = this.computeElementLovs(key, 'optic');
        this.originalOpticValues[key] = this.data.opticElements[key]?.value;
      });
    }

    // Cache guide params keys and values
    if (this.data.guideParamsElements) {
      this.guideParamsKeysCache = Object.keys(this.data.guideParamsElements).sort((a, b) => {
        const orderA = this.data.guideParamsElements[a]?.order || '';
        const orderB = this.data.guideParamsElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each guide param element
      this.guideParamsKeysCache.forEach(key => {
        this.guideParamsLovsCache[key] = this.computeElementLovs(key, 'guideParams');
        this.originalGuideParamsValues[key] = this.data.guideParamsElements[key]?.value;
      });
    }

    // Cache calibration params keys and values
    if (this.data.calParamsElements) {
      this.calParamsKeysCache = Object.keys(this.data.calParamsElements).sort((a, b) => {
        const orderA = this.data.calParamsElements[a]?.order || '';
        const orderB = this.data.calParamsElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each cal param element
      this.calParamsKeysCache.forEach(key => {
        this.calParamsLovsCache[key] = this.computeElementLovs(key, 'calParams');
        this.originalCalParamsValues[key] = this.data.calParamsElements[key]?.value;
      });
    }

    // Cache disabled corrections keys and values
    if (this.data.disCorrectionElements) {
      this.disCorrectionKeysCache = Object.keys(this.data.disCorrectionElements).sort((a, b) => {
        const orderA = this.data.disCorrectionElements[a]?.order || '';
        const orderB = this.data.disCorrectionElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each disCorrection element
      this.disCorrectionKeysCache.forEach(key => {
        this.disCorrectionLovsCache[key] = this.computeElementLovs(key, 'disCorrection');
        this.originalDisCorrectionValues[key] = this.data.disCorrectionElements[key]?.value;
      });
    }

    // Cache reversed corrections keys and values
    if (this.data.revCorrectionElements) {
      this.revCorrectionKeysCache = Object.keys(this.data.revCorrectionElements).sort((a, b) => {
        const orderA = this.data.revCorrectionElements[a]?.order || '';
        const orderB = this.data.revCorrectionElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs and original values for each revCorrection element
      this.revCorrectionKeysCache.forEach(key => {
        this.revCorrectionLovsCache[key] = this.computeElementLovs(key, 'revCorrection');
        this.originalRevCorrectionValues[key] = this.data.revCorrectionElements[key]?.value;
      });
    }
  }

  private computeElementLovs(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): ListOfValue[] {
    const element = this.getElement(key, type);
    if (!element) return [];

    // First check for globallov reference
    const globallovRef = (element as any).globallov;
    if (globallovRef && this.data.globallovs?.[globallovRef]) {
      const globalLov = this.data.globallovs[globallovRef];
      if (!globalLov.values) return [];
      return Object.keys(globalLov.values).map(k => ({
        value: k,
        label: globalLov.values[k]
      }));
    }

    // Otherwise check for local listOfValues
    const lovs = (element as any).listOfValues;
    if (!lovs) return [];

    if (Array.isArray(lovs)) {
      return lovs;
    } else {
      return Object.keys(lovs).map(k => ({
        value: k,
        label: lovs[k]
      }));
    }
  }

  hasParameters(): boolean {
    return this.data.parametersElements && Object.keys(this.data.parametersElements).length > 0;
  }

  hasDevices(): boolean {
    return this.data.devicesElements && Object.keys(this.data.devicesElements).length > 0;
  }

  hasOptic(): boolean {
    return this.data.opticElements && Object.keys(this.data.opticElements).length > 0;
  }

  hasGuideParams(): boolean {
    return this.data.guideParamsElements && Object.keys(this.data.guideParamsElements).length > 0;
  }

  hasCalParams(): boolean {
    return this.data.calParamsElements && Object.keys(this.data.calParamsElements).length > 0;
  }

  hasDisCorrection(): boolean {
    return this.data.disCorrectionElements && Object.keys(this.data.disCorrectionElements).length > 0;
  }

  hasRevCorrection(): boolean {
    return this.data.revCorrectionElements && Object.keys(this.data.revCorrectionElements).length > 0;
  }

  getParametersKeys(): string[] {
    return this.parametersKeysCache;
  }

  getDevicesKeys(): string[] {
    return this.devicesKeysCache;
  }

  getOpticKeys(): string[] {
    return this.opticKeysCache;
  }

  getGuideParamsKeys(): string[] {
    return this.guideParamsKeysCache;
  }

  getCalParamsKeys(): string[] {
    return this.calParamsKeysCache;
  }

  getDisCorrectionKeys(): string[] {
    return this.disCorrectionKeysCache;
  }

  getRevCorrectionKeys(): string[] {
    return this.revCorrectionKeysCache;
  }

  getElement(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): Element | null {
    let elements: { [key: string]: Element };
    if (type === 'parameters') {
      elements = this.data.parametersElements;
    } else if (type === 'devices') {
      elements = this.data.devicesElements;
    } else if (type === 'optic') {
      elements = this.data.opticElements;
    } else if (type === 'guideParams') {
      elements = this.data.guideParamsElements;
    } else if (type === 'calParams') {
      elements = this.data.calParamsElements;
    } else if (type === 'disCorrection') {
      elements = this.data.disCorrectionElements;
    } else {
      elements = this.data.revCorrectionElements;
    }
    return elements?.[key] || null;
  }

  getElementLabel(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): string {
    const element = this.getElement(key, type);
    return element?.label || key;
  }

  isStringWithLov(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return hasLocalLov || hasGlobalLov;
  }

  isStringWithoutLov(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return !hasLocalLov && !hasGlobalLov;
  }

  isNumeric(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'int' || element?.type === 'float';
  }

  isBool(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'bool';
  }

  getElementLovs(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): ListOfValue[] {
    let cache: { [key: string]: ListOfValue[] };
    if (type === 'parameters') {
      cache = this.parametersLovsCache;
    } else if (type === 'devices') {
      cache = this.devicesLovsCache;
    } else if (type === 'optic') {
      cache = this.opticLovsCache;
    } else if (type === 'guideParams') {
      cache = this.guideParamsLovsCache;
    } else if (type === 'calParams') {
      cache = this.calParamsLovsCache;
    } else if (type === 'disCorrection') {
      cache = this.disCorrectionLovsCache;
    } else {
      cache = this.revCorrectionLovsCache;
    }
    return cache[key] || [];
  }

  /**
   * Reset all parameters to their original values
   */
  resetAllParameters(): void {
    this.parametersKeysCache.forEach(key => {
      this.data.parametersElements[key].value = this.originalParametersValues[key];
    });
  }

  /**
   * Reset all devices to their original values
   */
  resetAllDevices(): void {
    this.devicesKeysCache.forEach(key => {
      this.data.devicesElements[key].value = this.originalDevicesValues[key];
    });
  }

  /**
   * Reset all optic parameters to their original values
   */
  resetAllOptic(): void {
    this.opticKeysCache.forEach(key => {
      this.data.opticElements[key].value = this.originalOpticValues[key];
    });
  }

  /**
   * Reset all guide parameters to their original values
   */
  resetAllGuideParams(): void {
    this.guideParamsKeysCache.forEach(key => {
      this.data.guideParamsElements[key].value = this.originalGuideParamsValues[key];
    });
  }

  /**
   * Reset all calibration parameters to their original values
   */
  resetAllCalParams(): void {
    this.calParamsKeysCache.forEach(key => {
      this.data.calParamsElements[key].value = this.originalCalParamsValues[key];
    });
  }

  /**
   * Reset all disabled corrections to their original values
   */
  resetAllDisCorrection(): void {
    this.disCorrectionKeysCache.forEach(key => {
      this.data.disCorrectionElements[key].value = this.originalDisCorrectionValues[key];
    });
  }

  /**
   * Reset all reversed corrections to their original values
   */
  resetAllRevCorrection(): void {
    this.revCorrectionKeysCache.forEach(key => {
      this.data.revCorrectionElements[key].value = this.originalRevCorrectionValues[key];
    });
  }

  /**
   * Check if element has a description/help text
   */
  getElementDescription(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): string {
    const element = this.getElement(key, type);
    return (element as any)?.description || (element as any)?.hint || '';
  }

  /**
   * Check if element has min/max constraints
   */
  getElementConstraints(key: string, type: 'parameters' | 'devices' | 'optic' | 'guideParams' | 'calParams' | 'disCorrection' | 'revCorrection'): string {
    const element = this.getElement(key, type);
    if (!element) return '';

    const constraints: string[] = [];

    if ((element as any)?.min !== undefined) {
      constraints.push(`min: ${(element as any).min}`);
    }
    if ((element as any)?.max !== undefined) {
      constraints.push(`max: ${(element as any).max}`);
    }
    if ((element as any)?.step !== undefined) {
      constraints.push(`step: ${(element as any).step}`);
    }

    return constraints.length > 0 ? ` (${constraints.join(', ')})` : '';
  }
}
