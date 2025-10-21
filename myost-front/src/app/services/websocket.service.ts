import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  OSTState,
  Module,
  ServerMessage,
  ClientMessage,
  FoldersDumpMessage,
  FilesDumpMessage,
  ModuleDumpMessage,
  StateEventMessage,
  ModuleMessageEvent,
  ModuleErrorEvent,
  ModuleWarningEvent
} from '../models/ost.models';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws: WebSocket | null = null;
  private wsUrl = 'ws://localhost:9624';

  // Application state using BehaviorSubject for reactive updates
  private stateSubject = new BehaviorSubject<OSTState>({
    connected: false,
    folders: [],
    files: [],
    modules: {}
  });

  // Observable for components to subscribe to
  public state$: Observable<OSTState> = this.stateSubject.asObservable();

  // Subject for raw WebSocket messages (for debugging)
  private messagesSubject = new Subject<any>();
  public messages$: Observable<any> = this.messagesSubject.asObservable();

  // Connection status
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    console.log('WebsocketService initialized');
  }

  /**
   * Connect to OST WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Already connected to WebSocket');
      return;
    }

    console.log('Connecting to OST server at', this.wsUrl);
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected!');
      this.connectedSubject.next(true);
      this.updateState({ connected: true });

      // Immediately request full state
      this.requestFullState();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Received message:', message.evt);

        // Emit raw message for debugging
        this.messagesSubject.next(message);

        // Handle message based on type
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.connectedSubject.next(false);
      this.updateState({ connected: false });

      // Attempt reconnection after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.connect();
      }, 5000);
    };
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the server
   */
  private send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent message:', message.evt);
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Request full state from server (Freadall)
   */
  requestFullState(): void {
    this.send({ evt: 'Freadall' });
  }

  /**
   * Update property elements (Fsetproperty)
   */
  setProperty(module: string, property: string, elements: { [key: string]: any }): void {
    this.send({
      evt: 'Fsetproperty',
      mod: module,
      dta: {
        [property]: {
          indi: 1,
          elements
        }
      }
    } as any);
  }

  /**
   * Create a new grid line (Flcreate)
   */
  createGridLine(module: string, property: string, elements: { [key: string]: any }): void {
    this.send({
      evt: 'Flcreate',
      mod: module,
      dta: {
        [property]: {
          elements
        }
      }
    } as any);
  }

  /**
   * Update a grid line (Flupdate)
   */
  updateGridLine(module: string, property: string, line: number, elements: { [key: string]: any }): void {
    this.send({
      evt: 'Flupdate',
      mod: module,
      dta: {
        [property]: {
          line,
          elements
        }
      }
    } as any);
  }

  /**
   * Delete a grid line (Fldelete)
   */
  deleteGridLine(module: string, property: string, line: number): void {
    this.send({
      evt: 'Fldelete',
      mod: module,
      dta: {
        [property]: {
          line
        }
      }
    } as any);
  }

  /**
   * Move grid line up (Flup)
   */
  moveGridLineUp(module: string, property: string, line: number): void {
    this.send({
      evt: 'Flup',
      mod: module,
      dta: {
        [property]: {
          line
        }
      }
    } as any);
  }

  /**
   * Move grid line down (Fldown)
   */
  moveGridLineDown(module: string, property: string, line: number): void {
    this.send({
      evt: 'Fldown',
      mod: module,
      dta: {
        [property]: {
          line
        }
      }
    } as any);
  }

  /**
   * Click on a post icon (Fposticon)
   */
  clickPostIcon(module: string, property: string, element: string): void {
    this.send({
      evt: 'Fsetproperty',
      mod: module,
      dta: {
        [property]: {
          indi: 1,
          elements: {
            [element]: true
          }
        }
      }
    } as any);
  }

  /**
   * Click on a pre icon (Fpreicon)
   */
  clickPreIcon(module: string, property: string, element: string): void {
    this.send({
      evt: 'Fsetproperty',
      mod: module,
      dta: {
        [property]: {
          indi: 1,
          elements: {
            [element]: true
          }
        }
      }
    } as any);
  }

  /**
   * Set badge value (Fbadge)
   */
  setBadge(module: string, property: string, value: any): void {
    this.send({
      evt: 'Fbadge',
      mod: module,
      dta: {
        [property]: {
          badge: value
        }
      }
    } as any);
  }

  /**
   * Handle incoming messages from server
   */
  private handleMessage(message: ServerMessage): void {
    switch (message.evt) {
      case 'foldersdump':
        this.handleFoldersDump(message as FoldersDumpMessage);
        break;
      case 'filesdump':
        this.handleFilesDump(message as FilesDumpMessage);
        break;
      case 'moduledump':
        this.handleModuleDump(message as ModuleDumpMessage);
        break;
      case 'se':
        // State event - partial module update
        this.handleStateEvent(message as StateEventMessage);
        break;
      case 'mm':
        // Module message (info)
        this.handleModuleMessage(message as ModuleMessageEvent);
        break;
      case 'me':
        // Module error
        this.handleModuleError(message as ModuleErrorEvent);
        break;
      case 'mw':
        // Module warning
        this.handleModuleWarning(message as ModuleWarningEvent);
        break;
      default:
        console.log('Unknown message type:', (message as any).evt);
    }
  }

  /**
   * Handle folders dump message
   */
  private handleFoldersDump(message: FoldersDumpMessage): void {
    console.log(`📁 Received ${message.fileevent.length} folders`);
    this.updateState({ folders: message.fileevent });
  }

  /**
   * Handle files dump message
   */
  private handleFilesDump(message: FilesDumpMessage): void {
    console.log(`📄 Received ${message.fileevent.length} files`);
    this.updateState({ files: message.fileevent });
  }

  /**
   * Handle module dump message
   */
  private handleModuleDump(message: ModuleDumpMessage): void {
    const moduleNames = Object.keys(message.modules);
    console.log(`📦 Received ${moduleNames.length} modules:`, moduleNames.join(', '));

    // Merge modules into current state
    const currentState = this.stateSubject.value;
    const updatedModules = {
      ...currentState.modules,
      ...message.modules
    };

    this.updateState({ modules: updatedModules });
  }

  /**
   * Handle state event (se) - partial property updates
   */
  private handleStateEvent(message: StateEventMessage): void {
    if (!message.modules) return;

    const currentState = this.stateSubject.value;
    const updatedModules = { ...currentState.modules };

    // For each module in the state event
    Object.keys(message.modules).forEach(moduleName => {
      const moduleUpdate = message.modules[moduleName];

      if (!updatedModules[moduleName]) {
        // Module doesn't exist yet, just add it
        updatedModules[moduleName] = moduleUpdate;
      } else {
        // Module exists, merge properties
        const existingModule = updatedModules[moduleName];
        const updatedProperties = { ...existingModule.properties };

        // Merge updated properties
        if (moduleUpdate.properties) {
          Object.keys(moduleUpdate.properties).forEach(propName => {
            const propUpdate = moduleUpdate.properties[propName];

            if (!updatedProperties[propName]) {
              // Property doesn't exist, add it
              updatedProperties[propName] = propUpdate;
            } else {
              // Property exists, merge elements
              updatedProperties[propName] = {
                ...updatedProperties[propName],
                ...propUpdate,
                elements: {
                  ...updatedProperties[propName].elements,
                  ...propUpdate.elements
                }
              };
            }
          });
        }

        updatedModules[moduleName] = {
          ...existingModule,
          properties: updatedProperties
        };
      }
    });

    console.log('📝 State event processed');
    this.updateState({ modules: updatedModules });
  }

  /**
   * Handle module message (info)
   */
  private handleModuleMessage(message: ModuleMessageEvent): void {
    Object.keys(message.modules).forEach(moduleName => {
      const moduleData = message.modules[moduleName];
      if (moduleData.message) {
        console.log(`[${moduleName}] INFO:`, moduleData.message.message);
        this.notificationService.info(moduleData.message.message, moduleName);
      }
    });
  }

  /**
   * Handle module error
   */
  private handleModuleError(message: ModuleErrorEvent): void {
    Object.keys(message.modules).forEach(moduleName => {
      const moduleData = message.modules[moduleName];
      if (moduleData.error) {
        console.error(`[${moduleName}] ERROR:`, moduleData.error.error);
        this.notificationService.error(moduleData.error.error, moduleName);
      }
    });
  }

  /**
   * Handle module warning
   */
  private handleModuleWarning(message: ModuleWarningEvent): void {
    Object.keys(message.modules).forEach(moduleName => {
      const moduleData = message.modules[moduleName];
      if (moduleData.warning) {
        console.warn(`[${moduleName}] WARNING:`, moduleData.warning.warning);
        this.notificationService.warning(moduleData.warning.warning, moduleName);
      }
    });
  }

  /**
   * Update application state (partial update)
   */
  private updateState(updates: Partial<OSTState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...updates };
    this.stateSubject.next(newState);
  }

  /**
   * Get current state snapshot
   */
  getState(): OSTState {
    return this.stateSubject.value;
  }

  /**
   * Get a specific module
   */
  getModule(moduleName: string): Module | null {
    return this.stateSubject.value.modules[moduleName] || null;
  }

  /**
   * Get all module names
   */
  getModuleNames(): string[] {
    return Object.keys(this.stateSubject.value.modules);
  }

  /**
   * Check if a module is loaded
   */
  hasModule(moduleName: string): boolean {
    return moduleName in this.stateSubject.value.modules;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connectedSubject.value;
  }
}
