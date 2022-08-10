import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@strive/user/user/user.service';
import { UserForm } from '@strive/user/user/forms/user.form';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { GoalService } from '@strive/goal/goal/goal.service';
import { createUser, Goal, User } from '@strive/model'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { orderBy, where } from 'firebase/firestore';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'strive-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPage {

  user$?: Observable<User | undefined>
  goals$?: Observable<Goal[]>

  userForm = new UserForm()

  constructor(
    private modalCtrl: ModalController,
    private user: UserService,
    private route: ActivatedRoute,
    private goal: GoalService,
    private stakeholder: GoalStakeholderService,
  ) {
    this.route.params.subscribe(params => {
      const uid = params['uid'] as string

      this.user$ = this.user.valueChanges(uid, { uid }).pipe(
        tap(user => this.userForm.patchValue(createUser(user)))
      )

      this.goals$ = this.stakeholder.groupChanges([
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      ]).pipe(
        switchMap(stakeholders => {
          const goalIds = stakeholders.map(stakeholder => stakeholder.goalId)
          return this.goal.valueChanges(goalIds)
        }),
        map(goals => goals.sort((a, b) => a.status === b.status ? 0 : a.status ? 1 : -1))
      )
    })
  }

  update() {
    console.error('users can update the user name themselves')
    // if (this.userForm.invalid) {
    //   console.error('invalid form')
    //   return
    // }

    // this.user.update(this.userForm.value, { params: { uid: this.userForm.uid.value }})
  }

  createGoal(uid: string) {
    // should create new upsert goal modal for admin
    // this.modalCtrl.create({
    //   component: UpsertGoalModalComponent,
    //   componentProps: { uid }
    // }).then(modal => modal.present())
  }
}
