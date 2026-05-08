import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  setTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const next = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  getCurrentTheme(): string {
    return document.documentElement.getAttribute('data-bs-theme') || 'light';
  }
}
