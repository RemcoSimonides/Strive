import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ImageModule } from '@strive/media/directives/image.module'

@Component({
  standalone: true,
  selector: '[asset][title] strive-small-thumbnail',
  templateUrl: 'small-thumbnail.component.html',
  styleUrls: ['./small-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ImageModule
  ]
})
export class SmallThumbnailComponent {
  @Input() image?: string
  @Input() asset = ''
  @Input() title = ''
  @Input() isFinished = false
  @Input() borderRadius = "12px"
}