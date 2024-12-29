import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { User } from '@strive/model'

@Component({
    selector: '[achiever] strive-milestone-assignee',
    templateUrl: './assignee.component.html',
    styleUrls: ['./assignee.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ImageDirective
    ]
})
export class AssigneeComponent {
  @Input() achiever!: User
}