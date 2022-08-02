import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { joinWith } from 'ngfire'

// Rxjs
import { combineLatest, Observable } from 'rxjs'
import { switchMap, map, filter, startWith, tap } from 'rxjs/operators';

// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/user.service';

// Model
import { Goal, GoalEvent, GoalStakeholder, enumEvent, StoryItem } from '@strive/model'

// Pages
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { GoalService } from '@strive/goal/goal/goal.service';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { where } from 'firebase/firestore';
import { getAggregatedMessage } from '@strive/notification/message/aggregated';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { StoryService } from '@strive/goal/story/story.service';
import { OptionsPopoverComponent, Roles, RolesForm } from './options/options.component';

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

  stakeholders$: Observable<GoalStakeholder & { goal: Goal, story: StoryItem[] }[]>
  form = new RolesForm(JSON.parse(localStorage.getItem('goals options')))

  constructor(
    public user: UserService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private stakeholder: GoalStakeholderService,
    private story: StoryService
  ) {
    const stakeholders$ = this.user.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.stakeholder.groupChanges([where('uid', '==', user.uid)])),
      joinWith({
        goal: stakeholder => this.goal.valueChanges(stakeholder.goalId),
        story: stakeholder => {
          const query = [where('createdAt', '>', stakeholder.lastCheckedGoal)]
          return this.story.valueChanges(query, { goalId: stakeholder.goalId }).pipe(
            map(story => story.filter(item => item.source.user.uid !== stakeholder.uid)),
            map(aggregateEvents),
            map(val => val.map(a => getAggregatedMessage(a)).filter(a => !!a).sort((a, b) => a.importance - b.importance))
          )
        }
      }, { shouldAwait: true })
    )

    this.stakeholders$ = combineLatest([
      stakeholders$,
      this.form.valueChanges.pipe(
        startWith(this.form.value),
        tap((value: Roles) => localStorage.setItem('goals options', JSON.stringify(value)))
      )
    ]).pipe(
      map(([ stakeholders, roles ]) => stakeholders.filter(stakeholder => {
          for (const [key, bool] of Object.entries(roles)) {
            if (bool && stakeholder[key]) return true
          }
        })
      )
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
    }).then(modal => modal.present())
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
}
