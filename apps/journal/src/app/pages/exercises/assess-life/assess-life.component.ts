import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ScreensizeService } from "@strive/utils/services/screensize.service";
import { SeoService } from "@strive/utils/services/seo.service";

@Component({
  selector: 'strive-assess-life',
  templateUrl: './assess-life.component.html',
  styleUrls: ['./assess-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessLifeComponent {
  constructor(
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({ title: 'Assess Life - Strive Journal' })
  }
}