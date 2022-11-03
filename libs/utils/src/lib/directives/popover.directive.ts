import { Location } from '@angular/common'
import { Directive, HostBinding, HostListener, OnDestroy } from '@angular/core'
import { Platform, PopoverController } from '@ionic/angular'

@Directive({
  selector: '[strivePopover]'
})
export class PopoverDirective implements OnDestroy {
  private returnData: unknown
  private returnRole?: string

  private backButtonSub = this.platform.backButton.subscribeWithPriority(101, () => {
    this.location.back()
  })

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
    window.history.pushState(null, '', window.location.href)

    this.popoverCtrl.getTop().then(() => {
      this.popover?.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnDestroy() {
    this.backButtonSub.unsubscribe()
  }

  dismiss(data?: unknown, role?: string) {
    this.returnData = data
    this.returnRole = role

    this.location.back()
  }
}