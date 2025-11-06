import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog-dialog',
  templateUrl: './catalog-dialog.component.html',
  styleUrls: ['./catalog-dialog.component.css']
})
export class CatalogDialogComponent implements OnInit, OnDestroy {
  @Input() searchResults: any[] = [];
  @Input() displayedColumns: string[] = [];

  searchTerm: string = '';
  private subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<CatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private wsService: WebsocketService
  ) {
    // Get data from parent component
    this.searchResults = data?.searchResults || [];
    this.displayedColumns = data?.displayedColumns || ['catalog', 'code', 'name', 'ra', 'dec', 'mag', 'diam', 'alias', 'actions'];
  }

  ngOnInit(): void {
    // Subscribe to state changes to get updated search results
    this.subscription.add(
      this.wsService.state$.subscribe(state => {
        if (state.modules['Navigator']) {
          const navigatorModule = state.modules['Navigator'];
          this.updateFromModule(navigatorModule);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Extract search results from Navigator module
   */
  private updateFromModule(navigatorModule: any): void {
    if (!navigatorModule || !navigatorModule.properties['results']) return;

    const results = navigatorModule.properties['results'];
    if (results.grid && results.gridheaders) {
      this.searchResults = this.parseResultsGrid(results);
    }
  }

  /**
   * Parse results grid data
   */
  private parseResultsGrid(results: any): any[] {
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

    return results.grid.map((row: any) => ({
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

  closeDialog(): void {
    this.dialogRef.close();
  }

  selectTarget(row: any, index: number): void {
    this.dialogRef.close(row);
  }

  /**
   * Perform search by sending WebSocket events to backend
   */
  performSearch(): void {
    if (!this.searchTerm.trim()) return;

    console.log(`Recherche catalogue pour: ${this.searchTerm}`);

    // First: send property update with search term
    this.wsService.setProperty('Navigator', 'search', {
      name: this.searchTerm
    });

    // Second: send posticon event to trigger search in backend
    this.wsService.sendPostIcon('Navigator', 'search', {
      name: {}
    });
  }
}
