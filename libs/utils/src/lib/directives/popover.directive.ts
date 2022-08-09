import { Location } from "@angular/common";
import { Directive, HostBinding, HostListener } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Directive({
  selector: 'strive-popover'
})
export class PopoverDirective {
  @HostBinding() popover?: HTMLIonPopoverElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss(this.returnData, this.returnRole)
  }

  private returnData: unknown
  private returnRole?: string

  constructor(
    protected location: Location,
    protected popoverCtrl: PopoverController
  ) {
    window.history.pushState(null, '', window.location.href)

    this.popoverCtrl.getTop().then(() => {
      this.popover?.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  dismiss(data?: unknown, role?: string) {
    this.returnData = data
    this.returnRole = role
    this.location.back()
  }
}