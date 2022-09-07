import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Router } from '@angular/router'
import { joinWith } from 'ngfire'
import { orderBy, where } from 'firebase/firestore'

import { BehaviorSubject, combineLatest, firstValueFrom, Observable } from 'rxjs'
import { switchMap, map, filter } from 'rxjs/operators'

import { SeoService } from '@strive/utils/services/seo.service'
import { UserService } from '@strive/user/user/user.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalEventService } from '@strive/goal/goal/goal-event.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

import { GoalStakeholder, StakeholderWithGoalAndEvents } from '@strive/model'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component'
import { delay } from '@strive/utils/helpers'
import { getProgress } from '@strive/goal/goal/pipes/progress.pipe'
import { isBefore, min } from 'date-fns'
import { GoalsModalComponent } from '@strive/goal/goal/components/modals/goals/goals-modal.component'

function fitableItems(width: number) {
  const maxWidth = 700
  const gap = 16
  const padding = 16
  const itemWidth = 60 + gap
  const gutter = padding * 2

  const space = maxWidth < width ? maxWidth : width
  const available = space - gutter + gap

  return Math.floor(available / itemWidth)
}

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

  all$: Observable<StakeholderWithGoalAndEvents[]>
  seeAll = new BehaviorSubject(false)

  achieving$: Observable<StakeholderWithGoalAndEvents[]>
  stakeholders$: Observable<StakeholderWithGoalAndEvents[]>

  constructor(
    public user: UserService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private router: Router,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private stakeholder: GoalStakeholderService,
    private goalEvent: GoalEventService
  ) {
    this.all$ = this.user.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.stakeholder.groupChanges([where('uid', '==', user!.uid), orderBy('createdAt', 'desc')])),
      joinWith({
        goal: (stakeholder: GoalStakeholder) => this.goal.valueChanges(stakeholder.goalId),
        events: (stakeholder: GoalStakeholder) => {
          const query = [where('source.goal.id', '==', stakeholder.goalId), where('createdAt', '>', stakeholder.lastCheckedGoal)]
          return this.goalEvent.valueChanges(query).pipe(
            map(events => events.filter(event => event.source.user?.uid !== stakeholder.uid)),
          )
        }
      }, { shouldAwait: true }),
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal)), // <-- in case a goal is being removed
    ) as any

    const fitableItems$ = this.screensize.width$.pipe(map(fitableItems))

    this.achieving$ = combineLatest([
      this.all$.pipe(
        map(stakeholders => stakeholders.filter(stakeholder => !stakeholder.isAchiever)),
        map(stakeholders => stakeholders.sort((a, b) => {
          if (!a.events || !b.events) return 0
          if (a.events.length > 0 && b.events.length === 0) return -1
          if (a.events.length === 0 && b.events.length > 0) return 1

          const earliestA = min(a.events.map((event: any) => event.createdAt!))
          const earliestB = min(b.events.map((event: any) => event.createdAt!))
          return isBefore(earliestA, earliestB) ? -1 : 1
        }))
      ),
      fitableItems$
    ]).pipe(
      map(([ stakeholders, items ]) => {
        if (stakeholders.length > items) {
          this.seeAll.next(true)
          return stakeholders.splice(0, items - 1)
        } else {
          this.seeAll.next(false)
          return stakeholders.splice(0, items)
        }
      })
    ) as any
    
    this.stakeholders$ = this.all$.pipe(
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.isAchiever)),
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

  async openAllModal(stakeholder?: StakeholderWithGoalAndEvents) {
    if (stakeholder?.events.length === 0) {
      this.router.navigate(['/goal/', stakeholder.goal.id])
      return
    } 

    const stakeholders = stakeholder ? [stakeholder] : await firstValueFrom(this.all$)
    this.modalCtrl.create({
      component: GoalsModalComponent,
      componentProps: { stakeholders }
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
