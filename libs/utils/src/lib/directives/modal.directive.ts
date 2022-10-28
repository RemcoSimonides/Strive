import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'

@Directive({
  selector: '[striveModal]'
})
export class ModalDirective {
  private data?: unknown

  @HostBinding() modal?: HTMLIonModalElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss(this.data)
  }

  constructor(
    protected location: Location,
    protected modalCtrl: ModalController
  ) {
    if (Capacitor.getPlatform() === 'web') {
      window.history.pushState(null, '', window.location.href)

      this.modalCtrl.getTop().then(() => {
        this.modal?.onWillDismiss().then(res => {
          if (res.role === 'backdrop') this.location.back()
        })
      })
    }
  }

  dismiss(data?: unknown) {
    this.data = data
    if (Capacitor.getPlatform() === 'web') {
      this.location.back()
    } else {
      this.modalCtrl.dismiss(this.data)
    }
  }
}