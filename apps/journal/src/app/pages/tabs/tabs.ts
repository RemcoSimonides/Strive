import { ChangeDetectionStrategy, Component } from '@angular/core';
// Services
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { UserService } from '@strive/user/user/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { SupportService } from '@strive/support/support.service';

@Component({
  templateUrl: 'tabs.html',
  styleUrls: ['./tabs.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {

  private route$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd), startWith({ url: this.router.url }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  profileActive$ = combineLatest([
    this.route$,
    this.user.user$.pipe(map(user => user?.uid))
  ]).pipe(
    map(([nav, uid]) => {
      const url = nav['url']
      if (url === '/profile' || url === '/profile/') return true
      if (uid) return url === `/profile/${uid}`
      return false
    })
  );

  homeActive$ = this.route$.pipe(
    map(nav => {
      const url = nav['url']
      return url === '/goals' || url === '/'
    })
  )

  hasSupportNeedingDecision$ = this.support.hasSupportNeedingDecision$

  constructor(
    public user: UserService,
    public screenSize: ScreensizeService,
    public router: Router,
    private support: SupportService
  ) {}

}
