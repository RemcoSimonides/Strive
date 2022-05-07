import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ScreensizeService } from "@strive/utils/services/screensize.service";

@Component({
  selector: 'strive-dear-future-self',
  templateUrl: './dear-future-self.component.html',
  styleUrls: ['./dear-future-self.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DearFutureSelfComponent {
  constructor(public screensize: ScreensizeService) {}
}