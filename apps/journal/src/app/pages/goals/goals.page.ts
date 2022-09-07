import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular'
import { Router } from '@angular/router'
import { joinWith } from 'ngfire'
import { orderBy, where } from 'firebase/firestore'

import { combineLatest, Observable } from 'rxjs'
import { switchMap, map, filter, startWith, tap } from 'rxjs/operators'

import { SeoService } from '@strive/utils/services/seo.service'
import { UserService } from '@strive/user/user/user.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalEventService } from '@strive/goal/goal/goal-event.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

import { Goal, GoalEvent, GoalStakeholder, GoalStakeholderRole } from '@strive/model'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component'
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component'
import { OptionsPopoverComponent, Roles, RolesForm } from './options/options.component'
import { delay } from '@strive/utils/helpers'
import { getProgress } from '@strive/goal/goal/pipes/progress.pipe'

type StakeholderWithGoalAndEvents = GoalStakeholder & { goal: Goal, events: GoalEvent[] }

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

  stakeholders$: Observable<StakeholderWithGoalAndEvents[]>
  form = new RolesForm(JSON.parse(localStorage.getItem('goals options') ?? '{"isAchiever":true,"isSupporter":false,"isAdmin":false}'))

  constructor(
    public user: UserService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private stakeholder: GoalStakeholderService,
    private goalEvent: GoalEventService
  ) {
    const stakeholders$ = this.user.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.stakeholder.groupChanges([where('uid', '==', user!.uid), orderBy('createdAt', 'desc')])),
      joinWith({
        goal: (stakeholder: GoalStakeholder) => this.goal.valueChanges(stakeholder.goalId),
        story: (stakeholder: GoalStakeholder) => {
          const query = [where('source.goal.id', '==', stakeholder.goalId), where('createdAt', '>', stakeholder.lastCheckedGoal)]
          return this.goalEvent.valueChanges(query).pipe(
            map(events => events.filter(event => event.source.user?.uid !== stakeholder.uid)),
          )
        }
      }, { shouldAwait: true }),
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal)), // <-- in case a goal is being removed
    )

    this.stakeholders$ = combineLatest([
      stakeholders$.pipe(
        map(stakeholders => stakeholders.sort((first, second) => {
          // Sort finished goals to the end and in progress goals to top
          const a = getProgress(first.goal!)
          const b = getProgress(second.goal!)

          if (a === b) return 0
          if (b === 1) return -1
          if (a === 1) return 1

          if (a > b) return -1
          if (a < b) return 1
          return 0
        }))
      ),
      this.form.valueChanges.pipe(
        startWith(this.form.value as any),
        tap((value: Roles) => localStorage.setItem('goals options', JSON.stringify(value)))
      )
    ]).pipe(
      map(([ stakeholders, roles ]) => stakeholders.filter(stakeholder => {
        for (const [key, bool] of Object.entries(roles) as [GoalStakeholderRole, boolean][]) {
          if (key === 'isSpectator') continue
          if (bool && stakeholder[key]) return true
        }
        return false
      }))
    ) as any

    this.seo.generateTags({ title: `Goals - Strive Journal` })
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
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

  openGoalOptions(goal: Goal, stakeholder: GoalStakeholder, event: UIEvent) {
    event.stopPropagation()
    event.preventDefault()

    this.popoverCtrl.create({
      component: GoalOptionsComponent,
      componentProps: { goal, stakeholder },
      event
    }).then(popover => popover.present())
  }

  openOptions(event: UIEvent) {
    this.popoverCtrl.create({
      component: OptionsPopoverComponent,
      componentProps: { form: this.form },
      event
    }).then(popover => popover.present())
  }

  trackByFn(_: number, stakeholder: GoalStakeholder) {
    return stakeholder.uid
  }

  async refresh($event: any) {
    await delay(500)
    $event?.target.complete()
  }
}
