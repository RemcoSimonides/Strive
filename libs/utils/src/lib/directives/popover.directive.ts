import { Location } from "@angular/common";
import { Directive, HostBinding, HostListener } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Directive({
  selector: 'strive-popover'
})
export class PopoverDirective {
  @HostBinding() popover: HTMLIonPopoverElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss()
  }

  constructor(
    protected location: Location,
    protected popoverCtrl: PopoverController
  ) {
    window.history.pushState(null, null, window.location.href)

    this.popoverCtrl.getTop().then(() => {
      this.popover.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  dismiss() {
    this.location.back()
  }
}