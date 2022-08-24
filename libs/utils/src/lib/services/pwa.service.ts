import { Injectable, ApplicationRef, OnDestroy } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { ToastController } from '@ionic/angular'
import { ReplaySubject, first, interval, concat, Subscription } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class PWAService implements OnDestroy {

  // https://web.dev/customize-install/
  private deferredPrompt: any;

  showInstallPromotion$ = new ReplaySubject<boolean>(1)

  private subs: Subscription[] = []

  constructor(
    appRef: ApplicationRef,
    sw: SwUpdate,
    toastCtrl: ToastController
  ) {
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true))
    const everyHour$ = interval(1 * 60 * 60 * 1000)
    const everyHoursOnceAppIsStable$ = concat(appIsStable$, everyHour$)

    this.subs.push(everyHoursOnceAppIsStable$.subscribe(() => sw.checkForUpdate()))

    const sub = sw.versionUpdates.subscribe(event => {

      switch (event.type) {
        case 'VERSION_DETECTED':
          break
        case 'VERSION_INSTALLATION_FAILED':
          break
        case 'VERSION_READY': {
          if (event.type === 'VERSION_READY') {
            toastCtrl.create({
              header: 'New version available',
              icon: 'alert-outline',
              buttons: [
                {
                  text: 'UPDATE',
                  handler: () => {
                    sw.activateUpdate().then(() => document.location.reload())
                  }
                }
              ]
            }).then(toast => toast.present())
          }
        }
      }
    })
    this.subs.push(sub)
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

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
