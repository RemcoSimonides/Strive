import { Component, Input } from '@angular/core';
// Ionic
import { Platform } from '@ionic/angular'
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: 'strive-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  @Input() title: string

  constructor(
    public platform: Platform,
    public screensize: ScreensizeService
  ) { }

}
