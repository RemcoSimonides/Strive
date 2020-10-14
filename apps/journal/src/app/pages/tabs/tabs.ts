import { Component, OnDestroy } from '@angular/core';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { ScreensizeService } from 'apps/journal/src/app/services/screensize/screensize.service';
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  templateUrl: 'tabs.html',
  styleUrls: ['./tabs.scss']
})
export class TabsPage implements OnDestroy {
  public _isDesktop: boolean

  private sub: Subscription
  private screenSizeSubscription: Subscription

  constructor(
    public user: UserService,
    private _screensizeService: ScreensizeService
  ) {

    this.screenSizeSubscription = this._screensizeService.isDesktopView().subscribe(isDesktop => this._isDesktop = isDesktop)

  }

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.screenSizeSubscription.unsubscribe()
  }
}
