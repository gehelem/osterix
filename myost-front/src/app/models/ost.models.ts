/**
 * OST WebSocket Protocol TypeScript Interfaces
 * Based on OST backend communication structure
 */

// Element types
export type ElementType = 'bool' | 'int' | 'float' | 'string' | 'date' | 'time' | 'img' | 'video' | 'light' | 'prg' | 'message';

// Permission levels
export enum Permission {
  ReadOnly = 0,
  WriteOnly = 1,
  ReadWrite = 2
}

// Status values
export enum Status {
  Idle = 0,
  Ok = 1,
  Busy = 2,
  Error = 3
}

// Switch rules
export enum SwitchRule {
  OneOfMany = 0,
  AtMostOne = 1,
  Any = 2
}

// Base element interface
export interface Element {
  type: ElementType;
  label: string;
  value: any;
  order: string;
  autoupdate?: boolean;
  badge?: boolean;
  directedit?: boolean;
  hint?: string;
  posticon?: string;
  preicon?: string;
}

// Numeric element (int/float)
export interface NumericElement extends Element {
  type: 'int' | 'float';
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  slider?: number;
}

// String element with optional LOV
export interface StringElement extends Element {
  type: 'string';
  listOfValues?: { [key: string]: string };
}

// Image element
export interface ImageElement extends Element {
  type: 'img';
  urljpeg: string;
  urlfits?: string;
  urloverlay?: string;
  urlthumbnail?: string;
  channels?: number;
  width?: number;
  height?: number;
  histogram?: number[][];
  mean?: number[];
  median?: number[];
  stddev?: number[];
  min?: number[];
  max?: number[];
  hfravg?: number;
  stars?: number;
  snr?: number;
  issolved?: boolean;
  solverra?: number;
  solverde?: number;
  showstats?: boolean;
}

// Video element
export interface VideoElement extends Element {
  type: 'video';
  url: string;
}

// Property interface
export interface Property {
  label: string;
  level1: string;
  level2: string;
  order: string;
  permission: Permission;
  status: Status;
  enabled: boolean;
  badge?: boolean;
  freevalue?: string;
  hasGrid: boolean;
  hasGraph: boolean;
  hasprofile: boolean;
  showElts: boolean;
  showGrid?: boolean;
  rule?: SwitchRule;
  gridLimit?: number;
  posticon1?: string;
  posticon2?: string;
  preicon1?: string;
  preicon2?: string;
  elements: { [key: string]: Element };
  grid?: any[][];
  gridheaders?: string[];
  graphType?: string;
  graphParams?: any;
}

// Error message
export interface ErrorMessage {
  datetime: string;
  error: string;
}

// Info message
export interface InfoMessage {
  datetime: string;
  message: string;
}

// Module info
export interface ModuleInfo {
  description: string;
  label: string;
  name: string;
}

// Global LOV
export interface GlobalLov {
  label: string;
  type: string;
  values: { [key: string]: string };
}

// Module interface
export interface Module {
  errors: { [key: string]: ErrorMessage };
  messages: { [key: string]: InfoMessage };
  globallovs: { [key: string]: GlobalLov };
  infos: ModuleInfo;
  help: string;
  properties: { [key: string]: Property };
  state?: any;
  warnings?: any;
}

// WebSocket messages from server
export interface FoldersDumpMessage {
  evt: 'foldersdump';
  fileevent: string[];
}

export interface FilesDumpMessage {
  evt: 'filesdump';
  fileevent: string[];
}

export interface ModuleDumpMessage {
  evt: 'moduledump';
  modules: { [moduleName: string]: Module };
}

export interface StateEventMessage {
  evt: 'se';
  modules: { [moduleName: string]: any };
}

export interface AllPropertiesMessage {
  evt: 'ap';
  modules: { [moduleName: string]: any };
}

// Module message (info)
export interface ModuleMessageEvent {
  evt: 'mm';
  modules: {
    [moduleName: string]: {
      message: {
        datetime: string;
        message: string;
      }
    }
  };
}

// Module error
export interface ModuleErrorEvent {
  evt: 'me';
  modules: {
    [moduleName: string]: {
      error: {
        datetime: string;
        error: string;
      }
    }
  };
}

// Module warning
export interface ModuleWarningEvent {
  evt: 'mw';
  modules: {
    [moduleName: string]: {
      warning: {
        datetime: string;
        warning: string;
      }
    }
  };
}

// WebSocket messages to server
export interface ReadAllMessage {
  evt: 'Freadall';
}

export interface UpdateMessage {
  evt: 'Fupdate';
  module: string;
  property: string;
  elements: { [key: string]: any };
}

export interface GridNewLineMessage {
  evt: 'Fgridnewline';
  module: string;
  property: string;
  elements: { [key: string]: any };
}

export interface PostIconMessage {
  evt: 'Fposticon';
  module: string;
  property: string;
  element: string;
}

export interface PreIconMessage {
  evt: 'Fpreicon';
  module: string;
  property: string;
  element: string;
}

// Union type for server messages
export type ServerMessage = FoldersDumpMessage | FilesDumpMessage | ModuleDumpMessage | StateEventMessage | AllPropertiesMessage | ModuleMessageEvent | ModuleErrorEvent | ModuleWarningEvent;

// Union type for client messages
export type ClientMessage = ReadAllMessage | UpdateMessage | GridNewLineMessage | PostIconMessage | PreIconMessage;

// History message for display
export interface HistoryMessage {
  datetime: string;
  moduleName: string;
  type: 'info' | 'warning' | 'error';
  message: string;
}

// Application state
export interface OSTState {
  connected: boolean;
  folders: string[];
  files: string[];
  modules: { [moduleName: string]: Module };
}
