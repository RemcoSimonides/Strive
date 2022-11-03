import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener, OnDestroy } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'

@Directive({
  selector: '[striveModal]'
})
export class ModalDirective implements OnDestroy {
  private data?: unknown

  private backButtonSub = this.platform.backButton.subscribeWithPriority(101, () => {
    this.location.back()
  })

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
    window.history.pushState(null, '', window.location.href)

    this.modalCtrl.getTop().then(() => {
      this.modal?.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnDestroy() {
    this.backButtonSub.unsubscribe()
  }

  dismiss(data?: unknown) {
    this.data = data
    this.location.back()
  }
}