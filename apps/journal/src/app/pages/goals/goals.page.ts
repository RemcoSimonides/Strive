import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Router } from '@angular/router'
import { joinWith } from 'ngfire'
import { orderBy, where } from 'firebase/firestore'

import { BehaviorSubject, Observable } from 'rxjs'
import { switchMap, map, filter } from 'rxjs/operators'

import { isBefore, min } from 'date-fns'
import { delay } from '@strive/utils/helpers'
import { getProgress } from '@strive/goal/goal/pipes/progress.pipe'

import { AuthService } from '@strive/user/auth/auth.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalEventService } from '@strive/goal/goal/goal-event.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'

import { filterGoalEvents, GoalStakeholder, StakeholderWithGoalAndEvents } from '@strive/model'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component'
import { GoalUpdatesModalComponent } from '@strive/goal/goal/components/modals/goals/goal-updates.component'

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

  seeAll = new BehaviorSubject(false)

  achieving$: Observable<StakeholderWithGoalAndEvents[]>
  stakeholders$: Observable<StakeholderWithGoalAndEvents[]>

  uid$ = this.auth.uid$

  constructor(
    private auth: AuthService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private router: Router,
    seo: SeoService,
    private stakeholder: GoalStakeholderService,
    private goalEvent: GoalEventService
  ) {
    seo.generateTags({ title: `Goals - Strive Journal` })
    const stakeholders$ = this.auth.user$.pipe(
      filter(profile => !!profile),
      switchMap(profile => this.stakeholder.valueChanges([where('uid', '==', profile?.uid), orderBy('createdAt', 'desc')])),
      joinWith({
        goal: (stakeholder: GoalStakeholder) => this.goal.valueChanges(stakeholder.goalId),
        events: (stakeholder: GoalStakeholder) => {
          const query = [where('goalId', '==', stakeholder.goalId), where('createdAt', '>', stakeholder.lastCheckedGoal)]
          return this.goalEvent.valueChanges(query).pipe(
            map(events => filterGoalEvents(events, stakeholder))
          )
        }
      }, { shouldAwait: true }),
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal)), // <-- in case a goal is being removed
    ) as Observable<StakeholderWithGoalAndEvents[]>

    this.achieving$ = stakeholders$.pipe(
      map(stakeholders => stakeholders.filter(stakeholder => !stakeholder.isAchiever)),
      map(stakeholders => stakeholders.sort((a, b) => {
        if (!a.events || !b.events) return 0
        if (a.events.length > 0 && b.events.length === 0) return -1
        if (a.events.length === 0 && b.events.length > 0) return 1

        const earliestA = min(a.events.map(event => event.createdAt))
        const earliestB = min(b.events.map(event => event.createdAt))
        return isBefore(earliestA, earliestB) ? -1 : 1
      }))
    )
    
    this.stakeholders$ = stakeholders$.pipe(
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.isAchiever)),
      map(stakeholders => stakeholders.sort((first, second) => {
        // Sort finished goals to the end and in progress goals to top
        const a = getProgress(first.goal)
        const b = getProgress(second.goal)

        if (a === b) return 0
        if (b === 1) return -1
        if (a === 1) return 1

        if (a > b) return -1
        if (a < b) return 1
        return 0
      }))
    )
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  openFollowedGoal(stakeholder: StakeholderWithGoalAndEvents) {
    if (stakeholder?.events.length === 0) {
      this.router.navigate(['/goal/', stakeholder.goal.id])
      return
    } 

    this.modalCtrl.create({
      component: GoalUpdatesModalComponent,
      componentProps: { stakeholder }
    }).then(modal => modal.present())
  }

  createGoal() {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => {
      modal.onDidDismiss().then((data) => {
        const navToGoal = data.data?.['navToGoal']
        if (navToGoal) this.router.navigate(['/goal', navToGoal ])
      })
      modal.present()
    })
  }

  trackByFn(_: number, stakeholder: GoalStakeholder) {
    return stakeholder.uid
  }

  async refresh($event: any) {
    await delay(500)
    $event?.target.complete()
  }
}
