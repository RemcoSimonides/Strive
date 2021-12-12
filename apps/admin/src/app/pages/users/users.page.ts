import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'strive-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPage {

  users$ = this.user.valueChanges()

  constructor(private user: UserService) {}
}
