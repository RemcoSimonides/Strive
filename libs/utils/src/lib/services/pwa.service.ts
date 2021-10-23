import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PWAService {

  // https://web.dev/customize-install/
  private deferredPrompt: any;

  showInstallPromotion$ = new ReplaySubject<boolean>(1)

  addEventListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e
      // Update UI notify the user they can install the PWA
      this.showInstallPromotion$.next(true)
    })

    window.addEventListener('appinstalled', () => {
      this.showInstallPromotion$.next(false)
      // Clear the deferredPrompt so it can be garbage collected
      this.deferredPrompt = null
    })
  }

  async showInstallPromotion() {
    this.deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice

    if (outcome === 'accepted') {
      this.showInstallPromotion$.next(false)
    }
  
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null
  }
}
