import { Component } from '@angular/core';
// Services
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  templateUrl: 'tabs.html',
  styleUrls: ['./tabs.scss']
})
export class TabsPage {

  constructor(
    public user: UserService,
    public screenSize: ScreensizeService
  ) {}

}
