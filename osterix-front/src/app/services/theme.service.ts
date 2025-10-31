import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$: Observable<boolean> = this.darkModeSubject.asObservable();

  constructor() {
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    this.setDarkMode(isDark);
  }

  /**
   * Toggle between dark and light theme
   */
  toggleDarkMode(): void {
    this.setDarkMode(!this.darkModeSubject.value);
  }

  /**
   * Set dark mode explicitly
   */
  setDarkMode(isDark: boolean): void {
    this.darkModeSubject.next(isDark);

    // Apply theme class to body
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Get current dark mode state
   */
  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
