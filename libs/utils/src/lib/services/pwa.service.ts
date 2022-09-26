import { isPlatformBrowser } from '@angular/common';
import { Injectable, ApplicationRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { ToastController } from '@ionic/angular'
import { ReplaySubject, Subscription, first, switchMap, tap, interval } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class PWAService implements OnDestroy {

  // https://web.dev/customize-install/
  private deferredPrompt: any;

  showInstallPromotion$ = new ReplaySubject<boolean>(1)

  private subs: Subscription[] = []

  constructor(
    appRef: ApplicationRef,
    sw: SwUpdate,
    toastCtrl: ToastController,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const everyHourOnceAppIsStable$ = appRef.isStable.pipe(
        tap(stable => console.log('app is stable: ', stable)),
        first(isStable => isStable),
        switchMap(() => interval(1 * 60 * 60 * 1000)) // check again every hour
      )

      this.subs.push(everyHourOnceAppIsStable$.subscribe(() => {
        console.log('checking for update: ', sw.isEnabled)
        sw.checkForUpdate().then(result => console.log('update available? ', result))
      }))

      const sub = sw.versionUpdates.subscribe(event => {
        console.log('verison updates event: ', event)
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
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  addEventListeners() {
    if (isPlatformBrowser(this.platformId)) {
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
