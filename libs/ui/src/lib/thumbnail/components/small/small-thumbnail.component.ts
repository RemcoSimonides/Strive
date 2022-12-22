import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: '[asset][title] strive-small-thumbnail',
  templateUrl: 'small-thumbnail.component.html',
  styleUrls: ['./small-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallThumbnailComponent {
  @Input() image?: string
  @Input() asset = ''
  @Input() title = ''
  @Input() isFinished = false
  @Input() borderRadius = "12px"
}