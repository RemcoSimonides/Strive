import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProfileService } from '@strive/user/user/+state/profile.service';

@Component({
  selector: 'strive-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPage {

  profiles$ = this.profile.groupChanges()

  constructor(private profile: ProfileService) {}
}
