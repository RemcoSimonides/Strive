import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { BehaviorSubject, map } from 'rxjs'
import { KeyboardStyle, Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'

export type Theme = 'dark' | 'light'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme$ = new BehaviorSubject<Theme>('light')
  light$ = this.theme$.pipe(map(theme => theme === 'light'))
  dark$ = this.theme$.pipe(map(theme => theme === 'dark'))

  private renderer: Renderer2

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null)
  }

  get theme() {
    return this.theme$.getValue()
  }

  set theme(mode: Theme) {
    if (mode) {
      this.setTheme(mode)
      this.saveTheme(mode)
    }
  }

  private saveTheme(mode: Theme) {
    localStorage.setItem('theme', mode)
  }

  setTheme(mode: Theme) {
    this.renderer.setAttribute(this.document.body, 'data-theme', mode)
    this.theme$.next(mode)
    
    if (Capacitor.getPlatform() !== 'web') {
      const style = mode === 'dark' ? KeyboardStyle.Dark : KeyboardStyle.Light
      Keyboard.setStyle({ style })
    }
  }

  toggle() {
    this.theme = this.theme$.getValue() === 'dark' ? 'light' : 'dark'
  }

  /** Get the current value of the theme */
  initTheme(mode: Theme) {
    if (typeof window === 'undefined') return

    const isDarkMedia = window.matchMedia('(prefers-color-scheme: dark)')

    let theme: Theme | undefined;
    // @dev check: https://web.dev/prefers-color-scheme/#finding-out-if-dark-mode-is-supported-by-the-browser
    if (isDarkMedia.media !== 'not all') {
      isDarkMedia.onchange = ({ matches }) => this.setTheme(matches ? 'dark' : 'light')
      theme = isDarkMedia.matches ? 'dark' : 'light'
    }
    if (localStorage) {
      const fromStorage = localStorage.getItem('theme') as Theme
      if (fromStorage) theme = fromStorage
    }
    this.setTheme(theme || mode)
  }
}
