import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener } from '@angular/core'
import { Capacitor } from '@capacitor/core'
import { Platform, PopoverController } from '@ionic/angular'

@Directive({
  selector: '[strivePopover]'
})
export class PopoverDirective {
  private returnData: unknown
  private returnRole?: string
  private isWeb = Capacitor.getPlatform() === 'web'

  @HostBinding() popover?: HTMLIonPopoverElement
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.popoverCtrl.dismiss(this.returnData, this.returnRole)
  }

  constructor(
    protected location: Location,
    protected platform: Platform,
    protected popoverCtrl: PopoverController
  ) {
    if (this.isWeb) {
      window.history.pushState(null, '', window.location.href)

      this.popoverCtrl.getTop().then(() => {
        this.popover?.onWillDismiss().then(res => {
          if (res.role === 'backdrop') this.location.back()
        })
      })
    }
  }

  dismiss(data?: unknown, role?: string) {
    if (this.isWeb) {
      this.returnData = data
      this.returnRole = role
      this.location.back()
    } else {
      this.popoverCtrl.dismiss(data, role)
    }
  }
}