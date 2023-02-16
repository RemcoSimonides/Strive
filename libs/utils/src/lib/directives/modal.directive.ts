import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'

@Directive({
  selector: '[striveModal]'
})
export class ModalDirective {
  private data?: unknown
  private isWeb = Capacitor.getPlatform() === 'web'

  @HostBinding() modal?: HTMLIonModalElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss(this.data)
  }

  constructor(
    protected location: Location,
    protected modalCtrl: ModalController,
    protected platform: Platform
  ) {
    if (this.isWeb) {
      window.history.pushState(null, '', window.location.href)
      
      this.modalCtrl.getTop().then(() => {
        this.modal?.onWillDismiss().then(res => {
          if (res.role === 'backdrop') this.location.back()
        })
      })
    }
  }

  dismiss(data?: unknown) {
    if (this.isWeb) {
      this.data = data
      this.location.back()
    } else {
      this.modalCtrl.dismiss(data)
    }
  }
}