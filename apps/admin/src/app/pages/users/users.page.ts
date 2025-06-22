import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ProfileService } from '@strive/user/profile.service'

@Component({
    selector: 'strive-users',
    templateUrl: './users.page.html',
    styleUrls: ['./users.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UsersComponent {
  private profileService = inject(ProfileService);


  users$ = this.profileService.valueChanges()

}
