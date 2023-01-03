import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ProfileService } from '@strive/user/profile.service'

@Component({
  selector: 'strive-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {

  users$ = this.profileService.valueChanges()

  constructor(private profileService: ProfileService) {}
}
