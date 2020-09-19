import { Component } from '@angular/core';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { ScreensizeService } from 'apps/journal/src/app/services/screensize/screensize.service';

@Component({
  templateUrl: 'tabs.html',
  styleUrls: ['./tabs.scss']
})
export class TabsPage {
  public _uid: string;
  public _isDesktop: boolean;

  private _userProfileSubscription: Subscription

  constructor(
    public auth: AuthService,
    private _screensizeService: ScreensizeService
  ) {

    this.auth.getCurrentuserProfileObs().subscribe(userProfile => {
      if (userProfile) {
        this._uid = userProfile.id
      }
    })

    this._screensizeService.isDesktopView().subscribe(isDesktop => this._isDesktop = isDesktop)

  }
}
