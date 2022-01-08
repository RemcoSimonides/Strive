import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { boolean } from "@strive/utils/decorators/decorators";

@Component({
  selector: '[asset][title] strive-small-thumbnail',
  templateUrl: 'small-thumbnail.component.html',
  styleUrls: ['./small-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallThumbnailComponent {
  @Input() image: string
  @Input() asset: string
  @Input() title: string
  @Input() @boolean isFinished: boolean
  @Input() borderRadius = "12px"
}