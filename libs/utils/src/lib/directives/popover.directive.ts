import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener, inject } from '@angular/core'
import { Capacitor } from '@capacitor/core'
import { PopoverController } from '@ionic/angular/standalone'

@Directive({
  selector: '[strivePopover]'
})
export class PopoverDirective {
  protected location = inject(Location);
  protected popoverCtrl = inject(PopoverController);

  private returnData: unknown
  private returnRole?: string
  private isWeb = Capacitor.getPlatform() === 'web'
  private isIOS = Capacitor.getPlatform() === 'ios'

  @HostBinding() popover?: HTMLIonPopoverElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss(this.returnData, this.returnRole)
  }

  constructor() {
    if (this.isWeb || this.isIOS) {
      window.history.pushState(null, '', window.location.href)

      this.popoverCtrl.getTop().then(() => {
        this.popover?.onWillDismiss().then(res => {
          if (res.role === 'backdrop') this.location.back()
        })
      })
    }
  }

  dismiss(data?: unknown, role?: string) {
    if (this.isWeb || this.isIOS) {
      this.returnData = data
      this.returnRole = role
      this.location.back()
    } else {
      this.popoverCtrl.dismiss(data, role)
    }
  }
}
