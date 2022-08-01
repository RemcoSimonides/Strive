import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UserLink } from '@strive/model'

@Component({
  selector: '[achiever] goal-milestone-assignee',
  templateUrl: './assignee.component.html',
  styleUrls: ['./assignee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeComponent {
  @Input() achiever: UserLink
}