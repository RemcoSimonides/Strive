import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { joinWith } from 'ngfire'

// Rxjs
import { Observable, of } from 'rxjs'
import { switchMap, map } from 'rxjs/operators';

// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';

// Interfaces
import { Goal, GoalEvent, GoalStakeholder } from '@strive/model'

// Pages
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { GoalService } from '@strive/goal/goal/goal.service';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { GoalEventService } from '@strive/goal/goal/goal-events.service';
import { where } from 'firebase/firestore';
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { getAggregatedMessage } from '@strive/notification/message/aggregated';

function aggregateEvents(events: GoalEvent[]): { event: enumEvent, count: number }[] {
  const counter: Record<string | number, number> = {};
  
  for (const { name } of events) {
    if (!counter[name]) counter[name] = 0;
    counter[name]++;
  }

  return Object.entries(counter).map(([event, count]) => ({ event: +event, count }))
}

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

  achievingGoals$: Observable<{ goal: Goal, events: GoalEvent[], stakeholder: GoalStakeholder }[]>

  constructor(
    public user: UserService,
    private goal: GoalService,
    private goalEventService: GoalEventService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.achievingGoals$ = this.user.user$.pipe(
      switchMap(user => user ? this.goal.getStakeholderGoals(user.uid, 'isAchiever', false) : of([])),
      joinWith({
        events: value => this.goalEventService.valueChanges([where('source.goal.id', '==', value.goal.id), where('createdAt', '>', value.stakeholder.lastCheckedGoal)]).pipe(
          map(aggregateEvents),
          map(aggregated => aggregated.map(a => getAggregatedMessage(a)).filter(a => !!a).sort((a, b) => a.importance - b.importance))
        )
      }, { shouldAwait: true })
    )

    this.seo.generateTags({ title: `Goals  & Exercises- Strive Journal` })
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
    }).then(modal => modal.present())
  }

  openGoalOptions(goal: Goal, stakeholder: GoalStakeholder, ev: UIEvent) {
    ev.stopPropagation()
    ev.preventDefault()

    this.popoverCtrl.create({
      component: GoalOptionsComponent,
      componentProps: { goal, stakeholder },
      event: ev
    }).then(popover => popover.present())
  }
}
