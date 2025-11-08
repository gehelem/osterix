import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsRequestedSubject = new Subject<void>();
  public settingsRequested$ = this.settingsRequestedSubject.asObservable();

  constructor() {
    // Listen for the custom event
    window.addEventListener('openModuleSettings', () => {
      this.settingsRequestedSubject.next();
    });
  }

  requestSettings(): void {
    this.settingsRequestedSubject.next();
  }
}
