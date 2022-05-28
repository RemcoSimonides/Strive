import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
// Ionic
import { Platform } from '@ionic/angular'
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: '[title] strive-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  @Input() title: string
  @Input() defaultBack = '/'

  constructor(
    private location: Location,
    private router: Router,
    public screensize: ScreensizeService
  ) { }

  back() {
    const state = this.location.getState() as { navigationId: number };

    if (state.navigationId === 1) {
      this.router.navigateByUrl(this.defaultBack)
    } else {
      this.location.back()
    }
  }
}
