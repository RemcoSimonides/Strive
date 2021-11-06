import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: '[asset][title] small-thumbnail',
  templateUrl: 'small-thumbnail.component.html',
  styleUrls: ['./small-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallThumbnailComponent {
  @Input() image: string
  @Input() asset: string
  @Input() title: string
  @Input() borderRadius = "12px"
}