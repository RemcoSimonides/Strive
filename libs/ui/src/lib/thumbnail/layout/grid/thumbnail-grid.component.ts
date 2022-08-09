import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList, TemplateRef, ViewEncapsulation } from "@angular/core";
import { ScreensizeService } from "@strive/utils/services/screensize.service";

@Component({
  selector: 'strive-thumbnail-grid',
  templateUrl: 'thumbnail-grid.component.html',
  styleUrls: ['./thumbnail-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ThumbnailGridComponent {
  @Input() width = 160

  @ContentChildren('thumb') thumbs?: QueryList<TemplateRef<any>>

  constructor(public screensize: ScreensizeService) {}
}