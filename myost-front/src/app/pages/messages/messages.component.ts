import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { HistoryMessage } from '../../models/ost.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {

  messages: HistoryMessage[] = [];
  filteredMessages: HistoryMessage[] = [];
  private subscription: Subscription | null = null;

  // Filter options
  filterType: 'all' | 'info' | 'warning' | 'error' = 'all';
  filterModule: string = 'all';
  availableModules: string[] = [];

  displayedColumns: string[] = ['datetime', 'type', 'module', 'message'];

  constructor(private wsService: WebsocketService) { }

  ngOnInit(): void {
    // Subscribe to message history
    this.subscription = this.wsService.messageHistory$.subscribe(messages => {
      this.messages = messages;
      this.updateAvailableModules();
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Update list of available modules from messages
   */
  private updateAvailableModules(): void {
    const modules = new Set<string>();
    this.messages.forEach(msg => modules.add(msg.moduleName));
    this.availableModules = Array.from(modules).sort();
  }

  /**
   * Apply filters to messages
   */
  applyFilters(): void {
    this.filteredMessages = this.messages.filter(msg => {
      const typeMatch = this.filterType === 'all' || msg.type === this.filterType;
      const moduleMatch = this.filterModule === 'all' || msg.moduleName === this.filterModule;
      return typeMatch && moduleMatch;
    });
  }

  /**
   * Get CSS class for message type
   */
  getTypeClass(type: string): string {
    switch (type) {
      case 'info':
        return 'type-info';
      case 'warning':
        return 'type-warning';
      case 'error':
        return 'type-error';
      default:
        return '';
    }
  }

  /**
   * Format datetime for display
   */
  formatDatetime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleString('fr-FR');
  }

  /**
   * Clear messages (send to backend)
   */
  clearHistory(): void {
    const confirmMessage = this.filterModule === 'all'
      ? 'Êtes-vous sûr de vouloir effacer l\'historique de tous les modules ?'
      : `Êtes-vous sûr de vouloir effacer l'historique du module ${this.filterModule} ?`;

    if (confirm(confirmMessage)) {
      if (this.filterModule === 'all') {
        // Clear messages for all loaded modules
        this.availableModules.forEach(moduleName => {
          this.wsService.clearMessages(moduleName);
        });
      } else {
        // Clear messages for the selected module only
        this.wsService.clearMessages(this.filterModule);
      }

      // Also clear local history (will be repopulated by backend response if needed)
      this.wsService.clearMessageHistory();
    }
  }
}
