import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener } from '@angular/core'
import { Capacitor } from '@capacitor/core'
import { PopoverController } from '@ionic/angular'

@Directive({
  selector: '[strivePopover]'
})
export class PopoverDirective {
  private returnData: unknown
  private returnRole?: string

  @HostBinding() popover?: HTMLIonPopoverElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss(this.returnData, this.returnRole)
  }

  constructor(
    protected location: Location,
    protected popoverCtrl: PopoverController
  ) {
    if (Capacitor.getPlatform() === 'web') {
      window.history.pushState(null, '', window.location.href)

      this.popoverCtrl.getTop().then(() => {
        this.popover?.onWillDismiss().then(res => {
          if (res.role === 'backdrop') this.location.back()
        })
      })
    }
  }

  dismiss(data?: unknown, role?: string) {
    this.returnData = data
    this.returnRole = role

    if (Capacitor.getPlatform() === 'web') {
      this.location.back()
    } else {
      this.popoverCtrl.dismiss(this.returnData, this.returnRole)
    }
  }
}