import { Component } from '@angular/core';
// Services
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  templateUrl: 'tabs.html',
  styleUrls: ['./tabs.scss']
})
export class TabsComponent {

  active$ = combineLatest([
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd), startWith({ url: this.router.url })),
    this.user.user$.pipe(map(user => user?.uid))
  ]).pipe(
    map(([nav, uid]) => uid ? nav['url'] === `/profile/${uid}` : nav['url'] === '/profile/')
  );

  constructor(
    public user: UserService,
    public screenSize: ScreensizeService,
    public router: Router,
  ) {}

}
