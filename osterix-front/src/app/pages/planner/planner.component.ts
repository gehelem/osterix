import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { Module, Property, Element } from '../../models/ost.models';
import { Subscription } from 'rxjs';
import { PlannerParametersDialogComponent, PlannerParametersDialogData } from './planner-parameters-dialog.component';

interface PlanningRow {
  dec: number;
  object: string;
  profile: string;
  progress: { dynlabel: string; value: number };
  ra: number;
}

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css']
})
export class PlannerComponent implements OnInit, OnDestroy {
  // Module data
  plannerModule: Module | null = null;

  // Display columns for the planning grid
  displayedColumns: string[] = ['object', 'ra', 'dec', 'profile', 'progress', 'actions'];

  // Planning grid data
  planningRows: PlanningRow[] = [];

  // Object target properties (current object being planned)
  objectName: string = '';
  objectRA: number = 0;
  objectDEC: number = 0;
  currentProfile: string = 'default';

  // Devices
  devicesElements: { [key: string]: Element } = {};
  devicesEnabled: boolean = true;

  // Parameters
  navigatorModule: string = 'Navigator';
  sequenceModule: string = 'Sequencer';

  // Progress
  globalProgress: number = 0;
  globalProgressLabel: string = 'Idle';

  // Status
  isRunning: boolean = false;
  currentStatus: string = 'Idle';

  // Action buttons states
  startEnabled: boolean = true;
  stopEnabled: boolean = false;

  private subscription = new Subscription();

  constructor(
    public wsService: WebsocketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes to get Planner module data
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Planner']) {
          this.plannerModule = state.modules['Planner'];
          console.log('Planner module loaded:', this.plannerModule);
          this.updateFromModule();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Update component data from module
   */
  private updateFromModule(): void {
    if (!this.plannerModule) return;

    const props = this.plannerModule.properties;

    // Update actions
    if (props['actions']?.elements) {
      this.startEnabled = props['actions'].elements['start']?.value === false;
      this.stopEnabled = props['actions'].elements['stop']?.value === false;
    }

    // Update planning grid
    if (props['planning']) {
      const planningProp = props['planning'];
      this.objectName = planningProp.elements['object']?.value || '';
      this.objectRA = planningProp.elements['ra']?.value || 0;
      this.objectDEC = planningProp.elements['dec']?.value || 0;
      this.currentProfile = planningProp.elements['profile']?.value || 'default';

      // Parse planning grid
      if (planningProp.grid && Array.isArray(planningProp.grid)) {
        this.planningRows = planningProp.grid.map((row: any[]) => ({
          dec: row[0],
          object: row[1],
          profile: row[2],
          progress: row[3],
          ra: row[4]
        }));
      }
    }

    // Update progress
    if (props['progress']?.elements['global']) {
      const progressData = props['progress'].elements['global'] as any;
      this.globalProgress = progressData.value || 0;
      this.globalProgressLabel = progressData.dynlabel || 'Idle';
      this.isRunning = this.globalProgress > 0 && this.globalProgress < 100;
    }

    // Update devices
    if (props['devices']?.elements) {
      this.devicesElements = props['devices'].elements;
    }

    // Update parameters
    if (props['parms']?.elements) {
      this.navigatorModule = props['parms'].elements['navigatormodule']?.value || 'Navigator';
      this.sequenceModule = props['parms'].elements['sequencemodule']?.value || 'Sequencer';
    }
  }

  /**
   * Open parameters dialog
   */
  openParametersDialog(): void {
    const dialogData: PlannerParametersDialogData = {
      objectName: this.objectName,
      objectRA: this.objectRA,
      objectDEC: this.objectDEC,
      objectEnabled: true,
      currentProfile: this.currentProfile,
      devicesElements: this.devicesElements,
      devicesEnabled: this.devicesEnabled,
      navigatorModule: this.navigatorModule,
      sequenceModule: this.sequenceModule,
      parametersEnabled: true,
      globallovs: this.plannerModule?.globallovs || {},
      onObjectChange: (name: string, value: any) => this.handleObjectChange(name, value),
      onDevicesChange: (name: string, value: any) => this.handleDevicesChange(name, value),
      onParametersChange: (name: string, value: any) => this.handleParametersChange(name, value),
      onProfileChange: (value: string) => this.handleProfileChange(value)
    };

    this.dialog.open(PlannerParametersDialogComponent, {
      width: '600px',
      data: dialogData
    });
  }

  /**
   * Start planning
   */
  onStart(): void {
    if (!this.plannerModule) return;
    this.wsService.setProperty('Planner', 'actions', {
      start: true
    });
  }

  /**
   * Stop planning
   */
  onStop(): void {
    if (!this.plannerModule) return;
    this.wsService.setProperty('Planner', 'actions', {
      stop: true
    });
  }

  /**
   * Delete a planning row
   */
  deleteRow(index: number): void {
    if (index >= 0 && index < this.planningRows.length) {
      this.planningRows.splice(index, 1);
    }
  }

  /**
   * Edit a planning row
   */
  editRow(index: number): void {
    if (index >= 0 && index < this.planningRows.length) {
      const row = this.planningRows[index];
      console.log('Edit row:', row);
      // TODO: Open edit dialog
    }
  }

  /**
   * Add a new planning row
   */
  addRow(): void {
    if (this.objectName && this.objectRA && this.objectDEC) {
      const newRow: PlanningRow = {
        object: this.objectName,
        ra: this.objectRA,
        dec: this.objectDEC,
        profile: this.currentProfile,
        progress: { dynlabel: 'Idle', value: 0 }
      };
      this.planningRows.push(newRow);
      this.wsService.createGridLine('Planner', 'planning', {
        object: newRow.object,
        ra: newRow.ra,
        dec: newRow.dec,
        profile: newRow.profile
      });
    }
  }

  // Event handlers
  private handleObjectChange(name: string, value: any): void {
    if (name === 'label') this.objectName = value;
    else if (name === 'ra') this.objectRA = value;
    else if (name === 'de') this.objectDEC = value;

    this.wsService.setProperty('Planner', 'planning', {
      [name]: value
    });
  }

  private handleDevicesChange(name: string, value: any): void {
    if (this.devicesElements[name]) {
      this.devicesElements[name].value = value;
    }
    this.wsService.setProperty('Planner', 'devices', {
      [name]: value
    });
  }

  private handleParametersChange(name: string, value: any): void {
    if (name === 'navigatormodule') this.navigatorModule = value;
    else if (name === 'sequencemodule') this.sequenceModule = value;

    this.wsService.setProperty('Planner', 'parms', {
      [name]: value
    });
  }

  private handleProfileChange(value: string): void {
    this.currentProfile = value;
  }

  /**
   * Format progress for display
   */
  formatProgress(value: number): string {
    return Math.round(value) + '%';
  }
}
