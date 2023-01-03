import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { createGoal, createGoalStakeholder, EventType, GoalEvent, GoalStakeholder } from '@strive/model'
import { GoalOptionsComponent } from '../goal-options/goal-options.component'
import { AggregatedMessage, getAggregatedMessage } from '@strive/notification/message/aggregated'

function aggregateEvents(events: GoalEvent[]): { event: EventType, count: number }[] {
  const counter: Partial<Record<EventType, number>> = {}
    
  for (const { name } of events) {
    if (!counter[name]) counter[name] = 0;
    (counter[name] as number)++;
  }

  return Object.entries(counter).map(([event, count]): any => ({ event, count }))
}

@Component({
  selector: '[goal] strive-goal-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalThumbnailComponent {

  @Input() goal = createGoal()

  _stakeholder = createGoalStakeholder()
  @Input() set stakeholder(stakeholder: GoalStakeholder | undefined) {
    this._stakeholder = stakeholder ? stakeholder : createGoalStakeholder()
  }

  messages: AggregatedMessage[] = []
  @Input() set events(events: GoalEvent[]) {
    if (!events) return
    this.messages = aggregateEvents(events)
      .map(a => getAggregatedMessage(a))
      .filter(a => !!a)
      .sort((a, b) => {
        if (a && b) return a.importance - b.importance
        else return 0 // <-- never
      }) as any
  }

  constructor(private popoverCtrl: PopoverController) {}

  openGoalOptions(event: UIEvent) {
    event.stopPropagation()
    event.preventDefault()

    this.popoverCtrl.create({
      component: GoalOptionsComponent,
      componentProps: {
        goal: this.goal,
        stakeholder: this._stakeholder
    }, event
    }).then(popover => popover.present())
  }
}