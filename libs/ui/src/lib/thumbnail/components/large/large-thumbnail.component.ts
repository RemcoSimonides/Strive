import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'strive-large-thumbnail',
  templateUrl: 'large-thumbnail.component.html',
  styleUrls: ['./large-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LargeThumbnailComponent {
  @Input() image?: string
  @Input() asset = ''
  @Input() title = ''
}