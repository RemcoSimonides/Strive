import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: 'strive-page-not-found',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotfoundComponent {
  constructor(public screensize: ScreensizeService) {}
}