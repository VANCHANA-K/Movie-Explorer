import { Injectable, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';
const KEY = 'movie_explorer_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>((localStorage.getItem(KEY) as Theme) || 'dark');
  theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const t = this._theme();
      document.documentElement.dataset['theme'] = t;
      localStorage.setItem(KEY, t);
    });
  }

  set(t: Theme) { this._theme.set(t); }
  toggle() { this._theme.set(this._theme() === 'dark' ? 'light' : 'dark'); }
}