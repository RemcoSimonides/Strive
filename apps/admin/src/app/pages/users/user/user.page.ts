import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { orderBy, where } from 'firebase/firestore'
import { joinWith } from '@strive/utils/firebase'

import { Observable, of } from 'rxjs'
import { filter, map, shareReplay, switchMap, tap } from 'rxjs/operators'

import { GoalService } from '@strive/goal/goal.service'
import { AffirmationService } from '@strive/exercises/affirmation/affirmation.service'
import { DearFutureSelfService } from '@strive/exercises/dear-future-self/dear-future-self.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { DailyGratitudeService } from '@strive/exercises/daily-gratitude/daily-gratitude.service'

import { UserForm } from '@strive/user/forms/user.form'
import { Affirmations, createUser, DailyGratitude, DearFutureSelf, exercises, Goal, GoalStakeholder, User } from '@strive/model'
import { getProgress } from '@strive/goal/pipes/progress.pipe'
import { ProfileService } from '@strive/user/profile.service'

type StakeholderWithGoal = GoalStakeholder & { goal: Goal }

@Component({
    selector: 'strive-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserPage {
  private affirmationService = inject(AffirmationService);
  private dailyGratitudeService = inject(DailyGratitudeService);
  private dearFutureSelfService = inject(DearFutureSelfService);
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private goal = inject(GoalService);
  private stakeholder = inject(GoalStakeholderService);

  exercises = exercises

  user$?: Observable<User | undefined>

  affirmations$?: Observable<Affirmations | undefined>
  dailyGratitude$?: Observable<DailyGratitude | undefined>
  dearFutureSelf$?: Observable<DearFutureSelf | undefined>

  stakeholders$?: Observable<StakeholderWithGoal[]>

  userForm = new UserForm()

  constructor() {
    this.route.params.subscribe(params => {
      const uid = params['uid'] as string

      this.user$ = this.profileService.valueChanges(uid).pipe(
        tap(user => this.userForm.patchValue(createUser(user))),
        shareReplay({ bufferSize: 1, refCount: true })
      )

      this.affirmations$ = this.user$.pipe(
        switchMap(user => user?.uid ? this.affirmationService.getAffirmations$(user.uid) : of(undefined))
      )

      this.dailyGratitude$ = this.user$.pipe(
        switchMap(user => user?.uid ? this.dailyGratitudeService.getSettings$(user.uid) : of(undefined))
      )

      this.dearFutureSelf$ = this.user$.pipe(
        switchMap(user => user?.uid ? this.dearFutureSelfService.getSettings$(user.uid) : of(undefined))
      )

      this.stakeholders$ = this.user$.pipe(
        filter(user => !!user),
        switchMap(user => this.stakeholder.valueChanges([where('uid', '==', user?.uid), orderBy('createdAt', 'desc')])),
        joinWith({
          goal: (stakeholder: GoalStakeholder) => this.goal.valueChanges(stakeholder.goalId)
        }, { shouldAwait: true }),
        map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal)), // <-- in case a goal is being removed
        map(stakeholders => stakeholders.sort((first, second) => {
          if (!first?.goal || !second?.goal) return 0
          // Sort finished goals to the end and in progress goals to top
          const a = getProgress(first.goal)
          const b = getProgress(second.goal)

          if (a === b) return 0
          if (b === 1) return -1
          if (a === 1) return 1

          if (a > b) return -1
          if (a < b) return 1
          return 0
        })),
      ) as any
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
