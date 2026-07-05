import { SplashScreen } from '@capacitor/splash-screen'

let hidden = false

/**
 * Hide the native splash screen via this wrapper (instead of SplashScreen.hide()
 * directly) so the startup fallback in AppComponent can tell whether a normal
 * hide path ran, and only report to Sentry when startup actually stalled.
 */
export function hideSplashScreen(): Promise<void> {
  hidden = true
  return SplashScreen.hide()
}

export function isSplashScreenHidden(): boolean {
  return hidden
}
