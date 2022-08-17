import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { joinWith } from 'ngfire'

// Rxjs
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { switchMap, map, filter, startWith, tap } from 'rxjs/operators';

// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/user.service';

// Model
import { EventType, Goal, GoalEvent, GoalStakeholder, GoalStakeholderRole, isOnlySpectator } from '@strive/model'

// Pages
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { GoalService } from '@strive/goal/goal/goal.service';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { orderBy, where } from 'firebase/firestore';
import { AggregatedMessage, getAggregatedMessage } from '@strive/notification/message/aggregated';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { GoalEventService } from '@strive/goal/goal/goal-event.service';
import { OptionsPopoverComponent, Roles, RolesForm } from './options/options.component';
import { Router } from '@angular/router';
import { delay } from '@strive/utils/helpers';
import { isCurrentFocus } from '@strive/goal/goal/pipes/current-focus.pipe';

function aggregateEvents(events: GoalEvent[]): { event: EventType, count: number }[] {
  const counter: Partial<Record<EventType, number>> = {};
  
  for (const { name } of events) {
    if (!counter[name]) counter[name] = 0;
    counter[name]!++;
  }

  return Object.entries(counter).map(([event, count]): any => ({ event, count }))
}

type StakeholderWithGoalAndEvents = GoalStakeholder & { goal: Goal, story: AggregatedMessage[] }

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

  stakeholders$: Observable<StakeholderWithGoalAndEvents[]>
  form = new RolesForm(JSON.parse(localStorage.getItem('goals options') ?? '{}'))
  hasGoals$ = new BehaviorSubject(false)
  hasGoalsOutsideFocus$ = new BehaviorSubject(false)
  hasGoalsInFocus$ = new BehaviorSubject(false)

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
      switchMap(user => this.stakeholder.groupChanges([where('uid', '==', user?.uid), orderBy('createdAt', 'desc')])),
      map(stakeholders => stakeholders.filter(s => !isOnlySpectator(s))),
      map(stakeholders => stakeholders.sort((a, b) => {
        // Sort finished goals to the end
        const order = ['active', 'bucketlist', 'finished']
        if (order.indexOf(a.status) > order.indexOf(b.status)) return 1
        if (order.indexOf(a.status) < order.indexOf(b.status)) return -1
        return 0
      })),
      joinWith({
        goal: (stakeholder: GoalStakeholder) => this.goal.valueChanges(stakeholder.goalId),
        story: (stakeholder: GoalStakeholder) => {
          const query = [where('source.goal.id', '==', stakeholder.goalId), where('createdAt', '>', stakeholder.lastCheckedGoal)]
          return this.goalEvent.valueChanges(query).pipe(
            map(events => events.filter(event => event.source.user?.uid !== stakeholder.uid)),
            map(aggregateEvents),
            map(val => val
              .map(getAggregatedMessage)
              .filter(a => !!a)
              .sort((a, b) => a!.importance - b!.importance)
            )
          )
        }
      }, { shouldAwait: true }),
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal)), // <-- in case a goal is being removed
      tap(stakeholders => {
        this.hasGoals$.next(!!stakeholders.length)
        const inFocus = stakeholders.filter(isCurrentFocus)
        this.hasGoalsInFocus$.next(!!inFocus.length)
        this.hasGoalsOutsideFocus$.next(stakeholders.length > inFocus.length)
      })
    )

    this.stakeholders$ = combineLatest([
      stakeholders$,
      this.form.valueChanges.pipe(
        startWith(this.form.value as any),
        tap((value: Roles) => localStorage.setItem('goals options', JSON.stringify(value)))
      )
    ]).pipe(
      map(([ stakeholders, roles ]) => stakeholders.filter(stakeholder => {
        if (isCurrentFocus(stakeholder)) return true // exception for goals with current focus
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
