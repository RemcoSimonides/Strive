import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UserLink } from "@strive/user/user/+state/user.firestore";

@Component({
  selector: '[achiever] goal-milestone-assignee',
  templateUrl: './assignee.component.html',
  styleUrls: ['./assignee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeComponent {
  @Input() achiever: UserLink
}