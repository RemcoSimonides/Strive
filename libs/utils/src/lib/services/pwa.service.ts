import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PWAService {

  // https://web.dev/customize-install/
  private deferredPrompt: any;

  appInstalled$ = new BehaviorSubject<boolean>(false);
  showInstallPromotion$ = new BehaviorSubject<boolean>(true);

  addEventListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e
      // Update UI notify the user they can install the PWA
      // this.showInstallPromotion()
      this.appInstalled$.next(false)
      this.showInstallPromotion$.next(true)
      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`)
    })

    window.addEventListener('appinstalled', () => {
      this.appInstalled$.next(true)
      this.showInstallPromotion$.next(false)
      // Clear the deferredPrompt so it can be garbage collected
      this.deferredPrompt = null
      // Optionally, send analytics event to indicate successful install
      console.log('PWA was installed')
    })

    window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
      let displayMode = 'browser';
      if (evt.matches) {
        displayMode = 'standalone';
      }
      // Log display mode change to analytics
      console.log('DISPLAY_MODE_CHANGED', displayMode);
    });
  }

  async showInstallPromotion() {
    this.appInstalled$.next(true)
    this.showInstallPromotion$.next(false)

    this.deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null
  }

  getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (document.referrer.startsWith('android-app://')) {
      return 'twa';
    } else if (navigator['standalone'] || isStandalone) {
      return 'standalone';
    }
    return 'browser';
  }

}
