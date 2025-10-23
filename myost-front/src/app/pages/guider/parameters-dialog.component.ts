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

  // Global LOVs from module
  globallovs: { [key: string]: GlobalLov };

  // Callbacks for direct changes
  onParametersChange: (name: string, value: any) => void;
  onDevicesChange: (name: string, value: any) => void;
  onOpticChange: (name: string, value: any) => void;
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
  parametersLovsCache: { [key: string]: ListOfValue[] } = {};
  devicesLovsCache: { [key: string]: ListOfValue[] } = {};
  opticLovsCache: { [key: string]: ListOfValue[] } = {};

  constructor(
    public dialogRef: MatDialogRef<ParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParametersDialogData
  ) {
    // Initialize all cached values in constructor
    this.initializeCaches();
  }

  private initializeCaches(): void {
    // Cache parameters keys
    if (this.data.parametersElements) {
      this.parametersKeysCache = Object.keys(this.data.parametersElements).sort((a, b) => {
        const orderA = this.data.parametersElements[a]?.order || '';
        const orderB = this.data.parametersElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs for each parameter element
      this.parametersKeysCache.forEach(key => {
        this.parametersLovsCache[key] = this.computeElementLovs(key, 'parameters');
      });
    }

    // Cache devices keys
    if (this.data.devicesElements) {
      this.devicesKeysCache = Object.keys(this.data.devicesElements).sort((a, b) => {
        const orderA = this.data.devicesElements[a]?.order || '';
        const orderB = this.data.devicesElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs for each device element
      this.devicesKeysCache.forEach(key => {
        this.devicesLovsCache[key] = this.computeElementLovs(key, 'devices');
      });
    }

    // Cache optic keys
    if (this.data.opticElements) {
      this.opticKeysCache = Object.keys(this.data.opticElements).sort((a, b) => {
        const orderA = this.data.opticElements[a]?.order || '';
        const orderB = this.data.opticElements[b]?.order || '';
        return orderA.localeCompare(orderB);
      });

      // Cache LOVs for each optic element
      this.opticKeysCache.forEach(key => {
        this.opticLovsCache[key] = this.computeElementLovs(key, 'optic');
      });
    }
  }

  private computeElementLovs(key: string, type: 'parameters' | 'devices' | 'optic'): ListOfValue[] {
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

  getParametersKeys(): string[] {
    return this.parametersKeysCache;
  }

  getDevicesKeys(): string[] {
    return this.devicesKeysCache;
  }

  getOpticKeys(): string[] {
    return this.opticKeysCache;
  }

  getElement(key: string, type: 'parameters' | 'devices' | 'optic'): Element | null {
    let elements: { [key: string]: Element };
    if (type === 'parameters') {
      elements = this.data.parametersElements;
    } else if (type === 'devices') {
      elements = this.data.devicesElements;
    } else {
      elements = this.data.opticElements;
    }
    return elements?.[key] || null;
  }

  getElementLabel(key: string, type: 'parameters' | 'devices' | 'optic'): string {
    const element = this.getElement(key, type);
    return element?.label || key;
  }

  isStringWithLov(key: string, type: 'parameters' | 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return hasLocalLov || hasGlobalLov;
  }

  isStringWithoutLov(key: string, type: 'parameters' | 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    if (!element || element.type !== 'string') return false;
    const hasLocalLov = !!(element as any).listOfValues;
    const hasGlobalLov = !!(element as any).globallov;
    return !hasLocalLov && !hasGlobalLov;
  }

  isNumeric(key: string, type: 'parameters' | 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'int' || element?.type === 'float';
  }

  isBool(key: string, type: 'parameters' | 'devices' | 'optic'): boolean {
    const element = this.getElement(key, type);
    return element?.type === 'bool';
  }

  getElementLovs(key: string, type: 'parameters' | 'devices' | 'optic'): ListOfValue[] {
    let cache: { [key: string]: ListOfValue[] };
    if (type === 'parameters') {
      cache = this.parametersLovsCache;
    } else if (type === 'devices') {
      cache = this.devicesLovsCache;
    } else {
      cache = this.opticLovsCache;
    }
    return cache[key] || [];
  }
}
