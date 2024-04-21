import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ImageModule } from '@strive/media/directives/image.module'
import { User } from '@strive/model'

@Component({
  standalone: true,
  selector: '[achiever] strive-milestone-assignee',
  templateUrl: './assignee.component.html',
  styleUrls: ['./assignee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ImageModule
  ]
})
export class AssigneeComponent {
  @Input() achiever!: User
}