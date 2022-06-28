import { Location } from "@angular/common";
import { Directive, HostBinding, HostListener } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Directive({
  selector: 'strive-modal'
})
export class ModalDirective {
  @HostBinding() modal: HTMLIonModalElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  constructor(
    protected location: Location,
    protected modalCtrl: ModalController
  ) {
    window.history.pushState(null, null, window.location.href)

    this.modalCtrl.getTop().then(() => {
      this.modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  dismiss() {
    this.location.back()
  }
}