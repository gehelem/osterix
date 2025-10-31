import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'info' | 'warning' | 'error';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Show a notification with the given type
   */
  show(message: string, type: NotificationType = 'info', moduleName?: string): void {
    const config: MatSnackBarConfig = {
      duration: 5000, // 5 seconds
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: this.getPanelClass(type)
    };

    // Add module name to message if provided
    const displayMessage = moduleName ? `[${moduleName}] ${message}` : message;

    this.snackBar.open(displayMessage, '✕', config);
  }

  /**
   * Show an info message
   */
  info(message: string, moduleName?: string): void {
    this.show(message, 'info', moduleName);
  }

  /**
   * Show a warning message
   */
  warning(message: string, moduleName?: string): void {
    this.show(message, 'warning', moduleName);
  }

  /**
   * Show an error message
   */
  error(message: string, moduleName?: string): void {
    this.show(message, 'error', moduleName);
  }

  /**
   * Get panel class based on notification type
   */
  private getPanelClass(type: NotificationType): string[] {
    switch (type) {
      case 'info':
        return ['snackbar-info'];
      case 'warning':
        return ['snackbar-warning'];
      case 'error':
        return ['snackbar-error'];
      default:
        return ['snackbar-info'];
    }
  }
}
