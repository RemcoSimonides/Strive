import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'
import { Router } from '@angular/router'
import { delay } from '../helpers'

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
    protected modalCtrl: ModalController
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

  beforeDismiss(): Promise<boolean> | boolean {
    return true
  }

  async dismiss(data?: unknown) {
    const canDismiss = await this.beforeDismiss()
    if (!canDismiss) return

    if (this.isWeb) {
      this.data = data
      this.location.back()
    } else {
      this.modalCtrl.dismiss(data)
    }
  }

  navigateTo(router: Router, path: string[]) {
    if (this.isWeb) {
      this.location.back()
      delay(250).then(() => {
        router.navigate(path)
      })
    } else {
      this.modalCtrl.dismiss()
      router.navigate(path)
    }
  }
}