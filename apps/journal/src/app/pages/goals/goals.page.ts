import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { ModalController, RefresherCustomEvent } from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router'
import { joinWith } from 'ngfire'
import { orderBy, where } from 'firebase/firestore'
import { SplashScreen } from '@capacitor/splash-screen'

import { BehaviorSubject, combineLatest, firstValueFrom, Observable } from 'rxjs'
import { switchMap, map, filter } from 'rxjs/operators'

import { isBefore, min } from 'date-fns'
import { delay } from '@strive/utils/helpers'
import { getProgress } from '@strive/goal/pipes/progress.pipe'

import { AuthService } from '@strive/user/auth/auth.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { GoalService } from '@strive/goal/goal.service'
import { GoalEventService } from '@strive/goal/goal-event.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'

import { filterGoalEvents, GoalStakeholder, StakeholderWithGoalAndEvents } from '@strive/model'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UpsertGoalModalComponent } from '@strive/goal/modals/upsert/upsert.component'
import { GoalUpdatesModalComponent } from '@strive/goal/modals/goal-updates/goal-updates.component'
import { CardsModalComponent } from '@strive/exercises/daily-gratitude/modals/cards/cards-modal.component'
import { AffirmModalComponent } from '@strive/exercises/affirmation/modals/affirm-modal.component'
import { MessageModalComponent } from '@strive/exercises/dear-future-self/components/message/message.component'
import { EntryModalComponent } from '@strive/exercises/wheel-of-life/modals/entry/entry.component'

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent implements OnDestroy {

  seeAll = new BehaviorSubject(false)

  achieving$: Observable<StakeholderWithGoalAndEvents[]>
  stakeholders$: Observable<StakeholderWithGoalAndEvents[]>

  uid$ = this.auth.uid$

  sub = this.route.queryParams.subscribe(async params => {
    const uid = await this.auth.getUID()
    if (!uid) return

    const { t, affirm, dfs } = params
    if (t === 'daily-gratitude') {
      this.modalCtrl.create({
        component: CardsModalComponent
      }).then(modal => modal.present())
    }

    if (t === 'wheeloflife') {
      this.modalCtrl.create({
        component: EntryModalComponent,
        componentProps: { showResults: true }
      }).then(modal => modal.present())
    }

    if (affirm) {
      this.modalCtrl.create({
        component: AffirmModalComponent,
        componentProps: { affirmation: decodeURI(affirm) }
      }).then(modal => modal.present())
    }

    if (dfs) {
      this.modalCtrl.create({
        component: MessageModalComponent,
        componentProps: { dfs }
      }).then(modal => modal.present())
    }
  })

  constructor(
    private auth: AuthService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
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
      map(stakeholders => stakeholders.filter(({ isAdmin, isAchiever, isSupporter, isSpectator }) => !isAchiever && (isAdmin || isSupporter || isSpectator))),
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

    firstValueFrom(
      combineLatest([
        this.stakeholders$,
        this.achieving$
      ])
    ).then(() => SplashScreen.hide())
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
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

  async refresh($event: RefresherCustomEvent) {
    await delay(500)
    $event?.target.complete()
  }
}
