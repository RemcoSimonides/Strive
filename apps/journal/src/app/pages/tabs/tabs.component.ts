import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'

import { combineLatest } from 'rxjs'
import { filter, map, shareReplay, startWith } from 'rxjs/operators'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { AuthService } from '@strive/auth/auth.service'
import { SupportService } from '@strive/support/support.service'

@Component({
  templateUrl: 'tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {

  private route$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd), startWith({ url: this.router.url }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  homeActive$ = this.route$.pipe(
    map(nav => nav.url.startsWith('/goals') || nav.url === '/')
  )

  supportActive$ = this.route$.pipe(
    map(nav => nav.url.startsWith('/supports'))
  )

  exerciseActive$ = this.route$.pipe(
    map(nav => nav.url.startsWith('/exercise'))
  )

  profileActive$ = combineLatest([
    this.route$,
    this.auth.profile$.pipe(map(profile => profile?.uid))
  ]).pipe(
    map(([nav, uid]) => {
      const url = nav.url
      if (url === '/profile' || url === '/profile/') return true
      if (uid) return url === `/profile/${uid}`
      return false
    })
  )

  hasSupportNeedingDecision$ = this.support.hasSupportNeedingDecision$
  profile$ = this.auth.profile$

  constructor(
    private auth: AuthService,
    public screenSize: ScreensizeService,
    public router: Router,
    private support: SupportService
  ) {}

}
