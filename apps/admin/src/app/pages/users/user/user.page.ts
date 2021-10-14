import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '@strive/user/user/+state/profile.service';
import { ProfileForm } from '@strive/user/user/forms/user.form';
import { Profile, User } from '@strive/user/user/+state/user.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { orderBy, where } from '@angular/fire/firestore';

@Component({
  selector: 'strive-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPage {

  user$: Observable<User>
  profile$: Observable<Profile>
  goals$: Observable<Goal[]>

  profileForm = new ProfileForm()

  constructor(
    private profile: ProfileService,
    private route: ActivatedRoute,
    private user: UserService,
    private goal: GoalService,
    private stakeholder: GoalStakeholderService,
  ) {
    this.route.params.subscribe(params => {
      const uid = params.uid as string

      this.user$ = this.user.valueChanges(uid)
      this.profile$ = this.profile.valueChanges(uid, { uid }).pipe(
        tap(profile => this.profileForm.patchValue(profile))
      )

      this.goals$ = this.stakeholder.groupChanges([
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      ]).pipe(
        switchMap(stakeholders => {
          const goalIds = stakeholders.map(stakeholder => stakeholder.goalId)
          return this.goal.valueChanges(goalIds)
        }),
        map(goals => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1))
      )
    })
  }

  update() {
    console.error('users can update the user name themselves')
    // if (this.profileForm.invalid) {
    //   console.error('invalid form')
    //   return
    // }

    // this.profile.update(this.profileForm.value, { params: { uid: this.profileForm.uid.value }})
  }
}
